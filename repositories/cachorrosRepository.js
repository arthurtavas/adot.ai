const db = require('../config/db');

// Colunas usadas pela aplicação (INSERT/UPDATE/views). Centralizadas num lugar só.
const COLUNAS = 'id, nome, raca, idade, porte, foto';

/** Escapa os curingas do LIKE (% _ \) para a busca tratar o texto digitado literalmente. */
function escaparLike(texto) {
  return texto.replace(/[\\%_]/g, '\\$&');
}

/** Lista cachorros; com `busca`, filtra por nome ou raça. */
async function listar({ busca = '' } = {}) {
  if (!busca) {
    const [linhas] = await db.query(`SELECT ${COLUNAS} FROM cachorros`);
    return linhas;
  }

  const termo = `%${escaparLike(busca)}%`;
  const [linhas] = await db.query(
    `SELECT ${COLUNAS} FROM cachorros WHERE nome LIKE ? OR raca LIKE ?`,
    [termo, termo]
  );
  return linhas;
}

/** Retorna o cachorro ou null se não existir. */
async function buscarPorId(id) {
  const [linhas] = await db.query(`SELECT ${COLUNAS} FROM cachorros WHERE id = ?`, [id]);
  return linhas[0] || null;
}

async function criar({ nome, raca, idade, porte, foto }) {
  await db.query(
    'INSERT INTO cachorros (nome, raca, idade, porte, foto) VALUES (?, ?, ?, ?, ?)',
    [nome, raca, idade, porte, foto]
  );
}

// Se `foto` vier undefined, a foto atual é mantida.
async function atualizar(id, { nome, raca, idade, porte, foto }) {
  const campos = ['nome = ?', 'raca = ?', 'idade = ?', 'porte = ?'];
  const valores = [nome, raca, idade, porte];

  if (foto !== undefined) {
    campos.push('foto = ?');
    valores.push(foto);
  }

  await db.query(`UPDATE cachorros SET ${campos.join(', ')} WHERE id = ?`, [...valores, id]);
}

async function remover(id) {
  await db.query('DELETE FROM cachorros WHERE id = ?', [id]);
}

module.exports = { listar, buscarPorId, criar, atualizar, remover };
