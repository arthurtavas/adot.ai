const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const HttpError = require('./httpError');

// As imagens ficam em public/uploads (já servida pelo express.static) e o banco
// guarda só o caminho, ex.: /uploads/1731864000000-a1b2c3d4e5f6.png
const PASTA_UPLOADS = path.join(__dirname, '..', 'public', 'uploads');
const URL_BASE = '/uploads/';

// Único formato de nome que salvarImagem() gera. removerImagem() só aceita este formato,
// então valores estranhos vindos do banco ("../../app.js", "/uploads/", subpastas...) nunca viram caminho.
const NOME_GERADO = /^\d{10,}-[a-f0-9]{12}\.(?:jpg|png)$/;

const ASSINATURA_PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

// Confere o conteúdo real do arquivo (o tipo informado pelo navegador pode ser falsificado).
function detectarExtensao(buffer) {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'jpg';
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(ASSINATURA_PNG)) return 'png';
  return null;
}

/** Grava a imagem enviada e devolve o caminho a ser salvo no banco. */
async function salvarImagem(arquivo) {
  const extensao = detectarExtensao(arquivo.buffer);
  if (!extensao) {
    throw new HttpError(400, 'Arquivo inválido. Envie uma imagem JPEG ou PNG.');
  }

  // O nome é gerado aqui: nunca usamos o nome enviado pelo usuário.
  const nome = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${extensao}`;

  await fs.mkdir(PASTA_UPLOADS, { recursive: true });
  await fs.writeFile(path.join(PASTA_UPLOADS, nome), arquivo.buffer, { flag: 'wx' });

  return URL_BASE + nome;
}

/**
 * Converte o valor guardado no banco ("/uploads/nome.png") no caminho absoluto do arquivo,
 * ou null se o valor não for uma foto enviada por upload (vazio, link externo, nome suspeito).
 */
function caminhoDaFoto(foto) {
  if (typeof foto !== 'string' || !foto.startsWith(URL_BASE)) return null;

  const nome = foto.slice(URL_BASE.length);
  if (!NOME_GERADO.test(nome)) return null; // barra "..", "/", "\\", "%2e", nomes vazios etc.

  const caminho = path.resolve(PASTA_UPLOADS, nome);
  if (path.dirname(caminho) !== PASTA_UPLOADS) return null; // defesa em profundidade: tem que estar DIRETO em uploads/
  return caminho;
}

/**
 * Apaga o arquivo de uma foto enviada por upload. Nunca lança erro:
 * quem chama já mexeu no banco e não deve falhar por causa de um arquivo.
 * - foto vazia / link externo / nome inválido: ignorado
 * - arquivo já inexistente (ENOENT): ignorado
 * - qualquer outra falha (permissão...): vai para o log; sobra no máximo um arquivo órfão
 */
async function removerImagem(foto) {
  const caminho = caminhoDaFoto(foto);
  if (!caminho) return;

  try {
    await fs.unlink(caminho);
  } catch (err) {
    if (err.code !== 'ENOENT') console.error(`Não foi possível apagar a imagem ${path.basename(caminho)}:`, err);
  }
}

module.exports = { PASTA_UPLOADS, salvarImagem, removerImagem };
