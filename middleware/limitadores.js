const { rateLimit } = require('express-rate-limit');

const JANELA = 15 * 60 * 1000; // 15 minutos

/**
 * Limite de "Quero Adotar" (POST /itens): por IP.
 * 10 pedidos/15 min é folgado para uma pessoa de verdade (várias famílias podem
 * dividir o mesmo IP) e inviabiliza script de spam. O bloqueio redireciona para
 * a vitrine com um aviso amigável em vez de uma tela de erro.
 */
const limiteInteresse = rateLimit({
  windowMs: JANELA,
  limit: 10,
  standardHeaders: 'draft-7', // envia RateLimit-* / Retry-After
  legacyHeaders: false,
  handler: (req, res) => res.redirect(303, '/?interesse=limite'),
});

/**
 * Limite de tentativas de login (POST /login): por IP, só conta as ERRADAS
 * (login correto não consome tentativa). Trava força bruta de senha.
 */
const limiteLogin = rateLimit({
  windowMs: JANELA,
  limit: 5,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (req, res) =>
    res.status(429).render('login', { erro: 'Muitas tentativas. Aguarde alguns minutos e tente de novo.' }),
});

module.exports = { limiteInteresse, limiteLogin };
