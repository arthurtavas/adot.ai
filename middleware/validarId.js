const HttpError = require('../utils/httpError');
const { parseId } = require('../utils/validators');

/**
 * Para usar com router.param('id', validarId).
 * Garante que :id é um inteiro positivo e já o entrega convertido em
 * req.params.id (number), então os controllers não precisam revalidar.
 */
function validarId(req, res, next, valor) {
  const id = parseId(valor);
  if (id === null) return next(new HttpError(400, 'ID inválido.'));
  req.params.id = id;
  next();
}

module.exports = validarId;
