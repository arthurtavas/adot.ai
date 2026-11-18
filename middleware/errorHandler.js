const HttpError = require('../utils/httpError');

/**
 * Middleware central de erros (substitui o try/catch repetido nas rotas).
 *
 * 1) HttpError  -> resposta em texto simples, igual ao comportamento anterior
 *                  das rotas ("Erro ao cadastrar cachorro.", etc.).
 * 2) Outros     -> (404 do http-errors, erro de body-parser, bug inesperado)
 *                  renderiza a view `error`, como já era feito.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  const status = err.status || 500;

  if (err instanceof HttpError) {
    if (status >= 500) console.error(`${err.message}`, err.cause || '');
    return res.status(status).send(err.message);
  }

  if (status >= 500) console.error(err);

  const emDesenvolvimento = req.app.get('env') === 'development';

  // Em produção, não vaza detalhes internos (mensagens do banco, caminhos...) em erros 5xx.
  res.locals.message = status >= 500 && !emDesenvolvimento ? 'Erro interno do servidor.' : err.message;
  res.locals.error = emDesenvolvimento ? err : {};

  res.status(status);
  res.render('error');
}

module.exports = errorHandler;
