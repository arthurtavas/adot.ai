const asyncHandler = require('../middleware/asyncHandler');
const cachorrosRepository = require('../repositories/cachorrosRepository');
const interessadosRepository = require('../repositories/interessadosRepository');
const { texto, parseId } = require('../utils/validators');

// Resultados possíveis do "Quero Adotar" (vêm em ?interesse=... após o redirect do servidor).
const AVISOS_INTERESSE = ['ok', 'duplicado', 'indisponivel', 'limite'];
const TAMANHO_MAXIMO_BUSCA = 100; // evita LIKE '%...%' com textos gigantes

// PÁGINA DO CLIENTE (GET /): apenas pesquisa e vitrine dos cachorros
const vitrine = asyncHandler('Erro ao carregar dados do banco.', async (req, res) => {
  const busca = texto(req.query.busca).slice(0, TAMANHO_MAXIMO_BUSCA);
  const cachorros = await cachorrosRepository.listar({ busca, apenasDisponiveis: true });

  const interesse = texto(req.query.interesse);
  const aviso = AVISOS_INTERESSE.includes(interesse) ? interesse : null;
  const petAviso = aviso ? texto(req.query.pet).slice(0, 100) : '';

  res.render('index', { cachorros, busca, aviso, petAviso });
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

  const petsDisponiveis = cachorros.filter((pet) => Number(pet.disponivel) === 1).length;
  res.render('loja', { cachorros, interessados, cachorroParaEditar, petsDisponiveis });
});

module.exports = { vitrine, loja };
