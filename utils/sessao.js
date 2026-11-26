const crypto = require('crypto');
const auth = require('../config/auth');

/**
 * Sessão sem estado: o cookie carrega só a validade e uma assinatura HMAC-SHA256.
 * Sem assinatura válida, o cookie é rejeitado, então ninguém consegue forjá-lo
 * sem conhecer o SESSION_SECRET. Não depende de memória do servidor (sobrevive a reinício).
 *
 * A chave de assinatura mistura o segredo com o hash da senha: ao TROCAR a senha,
 * todos os logins existentes deixam de valer automaticamente.
 */
const chave = crypto.createHmac('sha256', auth.secret).update(auth.passwordHash).digest();

function assinar(conteudo) {
  return crypto.createHmac('sha256', chave).update(conteudo).digest('base64url');
}

function criarToken() {
  const conteudo = Buffer.from(JSON.stringify({ exp: Date.now() + auth.duracaoMs })).toString('base64url');
  return `${conteudo}.${assinar(conteudo)}`;
}

function tokenValido(token) {
  if (typeof token !== 'string') return false;

  const partes = token.split('.');
  if (partes.length !== 2) return false;
  const [conteudo, assinatura] = partes;

  // Comparação em tempo constante (evita descobrir a assinatura byte a byte pelo tempo de resposta).
  const esperada = Buffer.from(assinar(conteudo));
  const recebida = Buffer.from(assinatura);
  if (esperada.length !== recebida.length || !crypto.timingSafeEqual(esperada, recebida)) return false;

  try {
    const { exp } = JSON.parse(Buffer.from(conteudo, 'base64url').toString('utf8'));
    return typeof exp === 'number' && exp > Date.now();
  } catch {
    return false;
  }
}

function estaAutenticado(req) {
  return tokenValido(req.cookies && req.cookies[auth.cookieName]);
}

/** Opções do cookie. `secure` acompanha o protocolo da requisição (HTTPS em produção, HTTP no localhost). */
function opcoesCookie(req) {
  return {
    httpOnly: true,       // JavaScript da página não consegue ler (mitiga roubo por XSS)
    sameSite: 'strict',   // o navegador não envia o cookie em requisições vindas de OUTROS sites (mitiga CSRF)
    secure: req.secure,   // só trafega por HTTPS quando o site está em HTTPS
    path: '/',
  };
}

function iniciarSessao(req, res) {
  res.cookie(auth.cookieName, criarToken(), { ...opcoesCookie(req), maxAge: auth.duracaoMs });
}

function encerrarSessao(req, res) {
  res.clearCookie(auth.cookieName, opcoesCookie(req));
}

module.exports = { estaAutenticado, iniciarSessao, encerrarSessao, tokenValido, criarToken };
