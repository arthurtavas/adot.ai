const bcrypt = require('bcryptjs');
const asyncHandler = require('../middleware/asyncHandler');
const auth = require('../config/auth');
const { estaAutenticado, iniciarSessao, encerrarSessao } = require('../utils/sessao');

const TAMANHO_MAXIMO_SENHA = 128; // evita gastar CPU comparando entradas absurdas

// GET /login
const formulario = (req, res) => {
  if (estaAutenticado(req)) return res.redirect('/loja');
  res.render('login', { erro: null });
};

// POST /login
const entrar = asyncHandler('Erro ao autenticar.', async (req, res) => {
  const senha = typeof req.body.senha === 'string' ? req.body.senha : '';

  const ok = senha.length > 0
    && senha.length <= TAMANHO_MAXIMO_SENHA
    && await bcrypt.compare(senha, auth.passwordHash);

  if (!ok) return res.status(401).render('login', { erro: 'Senha incorreta.' });

  iniciarSessao(req, res);
  res.redirect(303, '/loja'); // destino fixo: sem parâmetro "next", logo sem risco de open redirect
});

// POST /logout (POST, e não GET, para que um link/imagem de outro site não deslogue ninguém)
const sair = (req, res) => {
  encerrarSessao(req, res);
  res.set('Cache-Control', 'no-store');
  res.redirect(303, '/');
};

module.exports = { formulario, entrar, sair };
