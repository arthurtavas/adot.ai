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

/** Valida e normaliza o corpo do formulário "Quero Adotar". */
function validarInteressado(body = {}) {
  const dados = {
    nome_cliente: texto(body.nome_cliente),
    telefone: texto(body.telefone),
    cachorro_interesse: texto(body.cachorro_interesse),
    observacao: texto(body.observacao),
  };

  // observação é opcional
  exigirCampos(dados, ['nome_cliente', 'telefone', 'cachorro_interesse']);
  return dados;
}

module.exports = { texto, parseId, validarCachorro, validarInteressado };
