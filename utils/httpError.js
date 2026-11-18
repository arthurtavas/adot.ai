/**
 * Erro HTTP "esperado" da aplicação (validação, falha de banco, etc.).
 *
 * - `status`  : código HTTP que será devolvido ao navegador.
 * - `message` : texto simples exibido ao usuário (mesmo formato que o projeto
 *               já usava: res.status(...).send('mensagem')).
 * - `cause`   : erro original (ex.: erro do MySQL). Só vai para o log do
 *               servidor, nunca para o navegador.
 */
class HttpError extends Error {
  constructor(status, message, { cause } = {}) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.cause = cause;
  }
}

module.exports = HttpError;
