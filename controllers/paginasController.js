const asyncHandler = require('../middleware/asyncHandler');
const cachorrosRepository = require('../repositories/cachorrosRepository');
const interessadosRepository = require('../repositories/interessadosRepository');
const { texto, parseId } = require('../utils/validators');

// PÁGINA DO CLIENTE (GET /): apenas pesquisa e vitrine dos cachorros
const vitrine = asyncHandler('Erro ao carregar dados do banco.', async (req, res) => {
  const busca = texto(req.query.busca);
  const cachorros = await cachorrosRepository.listar({ busca });

  res.render('index', { cachorros, busca });
});

// ÁREA DA LOJA (GET /loja): gerenciar pets e ver solicitações de adoção
const loja = asyncHandler('Erro ao carregar dados da loja.', async (req, res) => {
  const editarId = parseId(req.query.editar);

  // As três consultas são independentes: rodam em paralelo em vez de uma após a outra.
  const [cachorros, interessados, cachorroParaEditar] = await Promise.all([
    cachorrosRepository.listar(),
    interessadosRepository.listar(),
    editarId ? cachorrosRepository.buscarPorId(editarId) : null,
  ]);

  res.render('loja', { cachorros, interessados, cachorroParaEditar });
});

module.exports = { vitrine, loja };
