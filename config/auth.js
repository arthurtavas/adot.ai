require('dotenv').config();

/**
 * Credenciais da área da loja, lidas SÓ de variáveis de ambiente (.env, que está no .gitignore).
 *  - ADMIN_PASSWORD_HASH : hash bcrypt da senha (NUNCA a senha em texto puro)
 *  - SESSION_SECRET      : segredo aleatório que assina o cookie de login
 * Gere os dois com:  npm run gerar-credenciais
 *
 * A aplicação se recusa a iniciar sem elas ("fail closed"): é melhor não subir
 * do que subir com a área administrativa sem proteção.
 */
const passwordHash = (process.env.ADMIN_PASSWORD_HASH || '').trim();
const secret = (process.env.SESSION_SECRET || '').trim();

const DICA = 'Rode "npm run gerar-credenciais" e copie as duas linhas geradas para o seu arquivo .env.';

if (!/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(passwordHash)) {
  throw new Error(`ADMIN_PASSWORD_HASH ausente ou inválida (precisa ser um hash bcrypt). ${DICA}`);
}
if (secret.length < 32) {
  throw new Error(`SESSION_SECRET ausente ou curta demais (mínimo 32 caracteres). ${DICA}`);
}

module.exports = {
  passwordHash,
  secret,
  cookieName: 'adot_sessao',
  duracaoMs: 4 * 60 * 60 * 1000, // o login expira em 4 horas
};
