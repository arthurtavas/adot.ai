const HttpError = require('./httpError');

/** Aceita apenas string; qualquer outra coisa (array, objeto, undefined) vira ''. */
function texto(valor) {
  return typeof valor === 'string' ? valor.trim() : '';
}

/** Devolve um inteiro positivo ou null (ex.: "12" -> 12, "abc" / "1abc" / "-3" -> null). */
function parseId(valor) {
  if (typeof valor !== 'string' && typeof valor !== 'number') return null;
  const s = String(valor).trim();
  if (!/^\d+$/.test(s)) return null;
  const n = Number(s);
  return Number.isSafeInteger(n) && n > 0 ? n : null;
}

/**
 * Reduz um telefone à forma canônica, para que "(14) 99999-8888", "14999998888"
 * e "+55 14 99999-8888" sejam reconhecidos como a MESMA pessoa.
 * Devolve só os dígitos (DDD + número, 10 ou 11 dígitos) ou null se não parecer um telefone brasileiro.
 */
function chaveTelefone(valor) {
  let digitos = String(valor).replace(/\D/g, '');
  if (digitos.length > 11 && digitos.startsWith('55')) digitos = digitos.slice(2); // código do país
  return digitos.length === 10 || digitos.length === 11 ? digitos : null;
}

function exigirCampos(dados, camposObrigatorios) {
  const faltando = camposObrigatorios.filter((campo) => !dados[campo]);
  if (faltando.length > 0) {
    throw new HttpError(400, `Campos obrigatórios não informados: ${faltando.join(', ')}.`);
  }
}

/** Valida e normaliza os campos de texto do formulário de cadastro/edição (a foto vem em req.file). */
function validarCachorro(body = {}) {
  const dados = {
    nome: texto(body.nome),
    raca: texto(body.raca),
    idade: texto(body.idade),
    porte: texto(body.porte),
  };

  exigirCampos(dados, ['nome', 'raca', 'idade', 'porte']);
  return dados;
}

// Tamanhos máximos: evitam gravar lixo gigante e erros de "Data too long" do MySQL virando 500.
const LIMITES_INTERESSADO = { nome_cliente: 100, telefone: 20, cachorro_interesse: 100, observacao: 255 };

/**
 * Valida e normaliza o corpo do formulário "Quero Adotar".
 * Além dos campos gravados, devolve `chaveTelefone` (só dígitos), usada para
 * detectar o mesmo contato enviando interesse repetido pelo mesmo pet.
 */
function validarInteressado(body = {}) {
  const dados = {
    nome_cliente: texto(body.nome_cliente),
    telefone: texto(body.telefone),
    cachorro_interesse: texto(body.cachorro_interesse),
    observacao: texto(body.observacao),
  };

  // observação é opcional
  exigirCampos(dados, ['nome_cliente', 'telefone', 'cachorro_interesse']);

  for (const [campo, maximo] of Object.entries(LIMITES_INTERESSADO)) {
    if (dados[campo].length > maximo) {
      throw new HttpError(400, `O campo ${campo} deve ter no máximo ${maximo} caracteres.`);
    }
  }

  const chave = chaveTelefone(dados.telefone);
  if (!chave) {
    throw new HttpError(400, 'Telefone inválido. Informe o DDD e o número, ex.: (14) 99999-8888.');
  }

  return { ...dados, chaveTelefone: chave };
}

module.exports = { texto, parseId, chaveTelefone, validarCachorro, validarInteressado };
