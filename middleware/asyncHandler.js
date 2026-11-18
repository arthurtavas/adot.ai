const HttpError = require('../utils/httpError');

/**
 * Envolve um controller assíncrono (Express 4 não captura promises rejeitadas).
 *
 * Qualquer erro inesperado (normalmente do banco) é convertido em um
 * HttpError 500 com `mensagemErro`, e segue para o middleware central de erros.
 * Erros que já são HttpError (ex.: validação 400) passam intactos.
 *
 * Isso elimina o try/catch + console.error + res.status(500) que estava
 * copiado em todas as rotas.
 */
function asyncHandler(mensagemErro, controller) {
  return async function (req, res, next) {
    try {
      await controller(req, res, next);
    } catch (err) {
      if (err instanceof HttpError) return next(err);
      next(new HttpError(500, mensagemErro, { cause: err }));
    }
  };
}

module.exports = asyncHandler;
