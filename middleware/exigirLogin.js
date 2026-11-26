const { estaAutenticado } = require('../utils/sessao');

/**
 * Protege rotas da área da loja. Sem login válido, manda para /login.
 * Use ANTES de qualquer outro middleware pesado (ex.: upload), para que
 * visitantes anônimos não consigam nem fazer o servidor processar arquivos.
 */
function exigirLogin(req, res, next) {
  // Páginas da loja têm dados internos: o navegador não deve guardá-las em cache
  // (senão o botão "voltar" mostraria a área restrita depois do logout).
  res.set('Cache-Control', 'no-store');

  if (estaAutenticado(req)) return next();
  res.redirect(303, '/login');
}

module.exports = exigirLogin;
