const asyncHandler = require('../middleware/asyncHandler');
const cachorrosRepository = require('../repositories/cachorrosRepository');
const HttpError = require('../utils/httpError');
const { validarCachorro } = require('../utils/validators');
const { salvarImagem, removerImagem } = require('../utils/fotos');

/**
 * Apaga o arquivo da foto, a menos que outro pet ainda use o mesmo caminho.
 * Roda DEPOIS de o banco já ter sido alterado, então nunca propaga erro:
 * na pior hipótese sobra um arquivo órfão, e o cadastro continua consistente.
 */
async function limparFoto(foto) {
  if (!foto) return; // pet sem foto
  try {
    if ((await cachorrosRepository.contarPorFoto(foto)) > 0) return;
    await removerImagem(foto);
  } catch (err) {
    console.error('Falha ao limpar a foto do pet:', err);
  }
}

// Incluir Cachorro (POST /cachorros) -> volta para /loja
const criar = asyncHandler('Erro ao cadastrar cachorro.', async (req, res) => {
  const dados = validarCachorro(req.body);
  const foto = req.file ? await salvarImagem(req.file) : '';

  try {
    await cachorrosRepository.criar({ ...dados, foto });
  } catch (err) {
    await removerImagem(foto); // não deixa arquivo órfão se o banco falhar
    throw err;
  }
  res.redirect('/loja');
});

// Editar Cachorro (POST /cachorros/editar/:id) -> volta para /loja
// Sem arquivo novo, a foto atual é mantida.
const editar = asyncHandler('Erro ao editar cachorro.', async (req, res) => {
  const dados = validarCachorro(req.body);

  // Confere que o pet existe ANTES de gravar a foto nova (antes, editar um id inexistente deixava a imagem órfã).
  const anterior = await cachorrosRepository.buscarPorId(req.params.id);
  if (!anterior) throw new HttpError(404, 'Cachorro não encontrado.');

  const novaFoto = req.file ? await salvarImagem(req.file) : undefined;

  try {
    await cachorrosRepository.atualizar(req.params.id, { ...dados, foto: novaFoto });
  } catch (err) {
    await removerImagem(novaFoto);
    throw err;
  }

  if (novaFoto) await limparFoto(anterior.foto); // apaga a foto substituída
  res.redirect('/loja');
});

// Tornar um pet disponível novamente (POST /cachorros/disponibilizar/:id).
const disponibilizar = asyncHandler('Erro ao atualizar disponibilidade do pet.', async (req, res) => {
  await cachorrosRepository.atualizarDisponibilidade(req.params.id, true);
  res.redirect('/loja');
});

// Excluir Cachorro (POST /cachorros/excluir/:id) -> volta para /loja
// Ordem segura: 1) banco, 2) arquivo. Se o banco falhar, o arquivo continua intacto (nada se perde);
// se apagar o arquivo falhar, o pet já foi removido e só sobra um órfão inofensivo (registrado no log).
const excluir = asyncHandler('Erro ao excluir cachorro.', async (req, res) => {
  const cachorro = await cachorrosRepository.buscarPorId(req.params.id);

  if (cachorro) {
    const removido = await cachorrosRepository.remover(cachorro.id);
    if (removido) await limparFoto(cachorro.foto);
  }
  res.redirect('/loja');
});

module.exports = { criar, editar, excluir, disponibilizar };
