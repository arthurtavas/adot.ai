const asyncHandler = require('../middleware/asyncHandler');
const cachorrosRepository = require('../repositories/cachorrosRepository');
const { validarCachorro } = require('../utils/validators');
const { salvarImagem, removerImagem } = require('../utils/fotos');

// Incluir Cachorro (POST /cachorros) -> volta para /loja
const criar = asyncHandler('Erro ao cadastrar cachorro.', async (req, res) => {
  const dados = validarCachorro(req.body);
  const foto = req.file ? await salvarImagem(req.file) : '';

  try {
    await cachorrosRepository.criar({ ...dados, foto });
  } catch (err) {
    await removerImagem(foto); // não deixa arquivo órfão se o banco falhar
    throw err;
  }
  res.redirect('/loja');
});

// Editar Cachorro (POST /cachorros/editar/:id) -> volta para /loja
// Sem arquivo novo, a foto atual é mantida.
const editar = asyncHandler('Erro ao editar cachorro.', async (req, res) => {
  const dados = validarCachorro(req.body);
  const anterior = await cachorrosRepository.buscarPorId(req.params.id);
  const novaFoto = req.file ? await salvarImagem(req.file) : undefined;

  try {
    await cachorrosRepository.atualizar(req.params.id, { ...dados, foto: novaFoto });
  } catch (err) {
    await removerImagem(novaFoto);
    throw err;
  }

  if (novaFoto && anterior) await removerImagem(anterior.foto); // apaga a foto substituída
  res.redirect('/loja');
});

// Excluir Cachorro (POST /cachorros/excluir/:id) -> volta para /loja
const excluir = asyncHandler('Erro ao excluir cachorro.', async (req, res) => {
  const cachorro = await cachorrosRepository.buscarPorId(req.params.id);
  await cachorrosRepository.remover(req.params.id);
  if (cachorro) await removerImagem(cachorro.foto);
  res.redirect('/loja');
});

module.exports = { criar, editar, excluir };
