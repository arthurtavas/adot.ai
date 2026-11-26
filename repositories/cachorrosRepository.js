const db = require('../config/db');

// Colunas usadas pela aplicação (INSERT/UPDATE/views). Centralizadas num lugar só.
const COLUNAS = 'id, nome, raca, idade, porte, foto, disponivel';

/** Escapa os curingas do LIKE (% _ \) para a busca tratar o texto digitado literalmente. */
function escaparLike(texto) {
  return texto.replace(/[\\%_]/g, '\\$&');
}

/** Lista cachorros; com `busca`, filtra por nome ou raça. */
async function listar({ busca = '', apenasDisponiveis = false } = {}) {
  const filtroDisponibilidade = apenasDisponiveis ? ' WHERE disponivel = 1' : '';
  if (!busca) {
    const [linhas] = await db.query(`SELECT ${COLUNAS} FROM cachorros${filtroDisponibilidade}`);
    return linhas;
  }

  const termo = `%${escaparLike(busca)}%`;
  const [linhas] = await db.query(
    `SELECT ${COLUNAS} FROM cachorros WHERE (nome LIKE ? OR raca LIKE ?)${apenasDisponiveis ? ' AND disponivel = 1' : ''}`,
    [termo, termo]
  );
  return linhas;
}

/** Retorna o cachorro ou null se não existir. */
async function buscarPorId(id) {
  const [linhas] = await db.query(`SELECT ${COLUNAS} FROM cachorros WHERE id = ?`, [id]);
  return linhas[0] || null;
}

/**
 * Procura um pet pelo nome (a comparação do MySQL ignora maiúsculas/acentos, conforme o collation).
 * Devolve o registro com o nome EXATO gravado no banco, ou null.
 */
async function buscarPorNome(nome) {
  const [linhas] = await db.query('SELECT id, nome, disponivel FROM cachorros WHERE nome = ? LIMIT 1', [nome]);
  return linhas[0] || null;
}

/** Reserva o pet somente se ainda estiver disponível (protege confirmações simultâneas). */
async function marcarIndisponivelSeDisponivel(id) {
  const [resultado] = await db.query('UPDATE cachorros SET disponivel = 0 WHERE id = ? AND disponivel = 1', [id]);
  return resultado.affectedRows > 0;
}

/** Altera a disponibilidade sem excluir o cadastro do pet. */
async function atualizarDisponibilidade(id, disponivel) {
  const [resultado] = await db.query('UPDATE cachorros SET disponivel = ? WHERE id = ?', [disponivel ? 1 : 0, id]);
  return resultado.affectedRows > 0;
}

/** Quantos pets ainda apontam para esta foto (evita apagar um arquivo que outro pet usa). */
async function contarPorFoto(foto) {
  const [linhas] = await db.query('SELECT COUNT(*) AS total FROM cachorros WHERE foto = ?', [foto]);
  return linhas[0].total;
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

/** Remove o pet. Devolve true se uma linha foi de fato apagada (false = já não existia). */
async function remover(id) {
  const [resultado] = await db.query('DELETE FROM cachorros WHERE id = ?', [id]);
  return resultado.affectedRows > 0;
}

module.exports = { listar, buscarPorId, buscarPorNome, marcarIndisponivelSeDisponivel, atualizarDisponibilidade, contarPorFoto, criar, atualizar, remover };
