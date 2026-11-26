const db = require('../config/db');
const { chaveTelefone } = require('../utils/validators');

const COLUNAS = 'id, nome_cliente, telefone, cachorro_interesse, observacao';

async function listar() {
  const [linhas] = await db.query(`SELECT ${COLUNAS} FROM interessados`);
  return linhas;
}

/**
 * Este contato (telefone) já registrou interesse neste pet?
 * Compara pelos dígitos do telefone, então formatos diferentes do mesmo número
 * ("(14) 99999-8888" x "14999998888") contam como o mesmo contato, inclusive
 * nos registros antigos, gravados com qualquer formato.
 * A consulta é filtrada por pet (poucas linhas), então comparar em JS é barato.
 */
async function existeInteresse({ cachorro_interesse, chaveTelefone: chave }) {
  const [linhas] = await db.query(
    'SELECT telefone FROM interessados WHERE cachorro_interesse = ?',
    [cachorro_interesse]
  );
  return linhas.some((linha) => chaveTelefone(linha.telefone) === chave);
}

async function criar({ nome_cliente, telefone, cachorro_interesse, observacao }) {
  await db.query(
    'INSERT INTO interessados (nome_cliente, telefone, cachorro_interesse, observacao) VALUES (?, ?, ?, ?)',
    [nome_cliente, telefone, cachorro_interesse, observacao]
  );
}

async function remover(id) {
  await db.query('DELETE FROM interessados WHERE id = ?', [id]);
}

module.exports = { listar, existeInteresse, criar, remover };
