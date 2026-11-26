const asyncHandler = require('../middleware/asyncHandler');
const cachorrosRepository = require('../repositories/cachorrosRepository');
const interessadosRepository = require('../repositories/interessadosRepository');
const { validarInteressado } = require('../utils/validators');
const comTrava = require('../utils/trava');

// Cliente registra interesse (POST /itens) -> volta para /, que mostra o resultado
// (?interesse=ok | duplicado | indisponivel). Quem decide é o servidor, não o navegador.
const criar = asyncHandler('Erro ao registrar interesse.', async (req, res) => {
  const dados = validarInteressado(req.body);

  // O pet precisa existir. Usamos o nome EXATO do banco, assim variações de
  // maiúsculas/acentos ("rex", "REX") não furam a regra de duplicidade.
  const pet = await cachorrosRepository.buscarPorNome(dados.cachorro_interesse);
  if (!pet || Number(pet.disponivel) !== 1) return res.redirect('/?interesse=indisponivel');
  dados.cachorro_interesse = pet.nome;

  // Regra: 1 interesse por contato (telefone) por pet. A trava faz "checar + inserir"
  // ser atômico para pedidos simultâneos do mesmo contato/pet (ataque com requisições em paralelo).
  const resultado = await comTrava(`${dados.chaveTelefone}|${pet.id}`, async () => {
    if (await interessadosRepository.existeInteresse(dados)) return 'duplicado';
    // A atualização condicional impede que duas pessoas reservem o mesmo pet ao mesmo tempo.
    const reservado = await cachorrosRepository.marcarIndisponivelSeDisponivel(pet.id);
    if (!reservado) return 'indisponivel';

    try {
      await interessadosRepository.criar(dados);
      return 'ok';
    } catch (err) {
      // Se o cadastro do interessado falhar, devolve o pet à vitrine.
      await cachorrosRepository.atualizarDisponibilidade(pet.id, true);
      throw err;
    }
  });

  res.redirect(`/?interesse=${resultado}&pet=${encodeURIComponent(pet.nome)}`);
});

// Excluir Interesse (POST /itens/excluir/:id) -> volta para /loja
const excluir = asyncHandler('Erro ao excluir interesse.', async (req, res) => {
  await interessadosRepository.remover(req.params.id);
  res.redirect('/loja');
});

module.exports = { criar, excluir };
