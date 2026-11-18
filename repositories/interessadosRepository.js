const db = require('../config/db');

const COLUNAS = 'id, nome_cliente, telefone, cachorro_interesse, observacao';

async function listar() {
  const [linhas] = await db.query(`SELECT ${COLUNAS} FROM interessados`);
  return linhas;
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

module.exports = { listar, criar, remover };
