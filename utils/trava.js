/**
 * Trava por chave (mutex assíncrono em memória).
 *
 * Executa `tarefa` só depois que todas as tarefas anteriores com a MESMA chave
 * terminarem; chaves diferentes rodam em paralelo, sem se bloquear.
 *
 * Por que existe: "checar se já existe" + "inserir" são duas operações. Sem trava,
 * um script que dispare 50 requisições idênticas ao mesmo tempo faz todas passarem
 * na checagem antes de qualquer uma inserir. Com a trava, a 2ª só checa depois que
 * a 1ª inseriu, e então é barrada.
 *
 * Limite: vale para UM processo Node. Com várias instâncias, a garantia definitiva
 * é um índice UNIQUE no banco (veja o README/explicação).
 */
const filas = new Map();

async function comTrava(chave, tarefa) {
  const anterior = filas.get(chave) || Promise.resolve();

  let liberar;
  const atual = new Promise((resolve) => { liberar = resolve; });
  const encadeada = anterior.then(() => atual);
  filas.set(chave, encadeada);

  await anterior;
  try {
    return await tarefa();
  } finally {
    liberar();
    // Só limpa se ninguém entrou na fila depois de nós (evita o Map crescer para sempre).
    if (filas.get(chave) === encadeada) filas.delete(chave);
  }
}

module.exports = comTrava;
