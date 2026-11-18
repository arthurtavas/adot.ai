const asyncHandler = require('../middleware/asyncHandler');
const interessadosRepository = require('../repositories/interessadosRepository');
const { validarInteressado } = require('../utils/validators');

// Cliente registra interesse (POST /itens) -> volta para / (a confirmação é exibida pela própria página)
const criar = asyncHandler('Erro ao registrar interesse.', async (req, res) => {
  const dados = validarInteressado(req.body);
  await interessadosRepository.criar(dados);
  res.redirect('/');
});

// Excluir Interesse (POST /itens/excluir/:id) -> volta para /loja
const excluir = asyncHandler('Erro ao excluir interesse.', async (req, res) => {
  await interessadosRepository.remover(req.params.id);
  res.redirect('/loja');
});

module.exports = { criar, excluir };
