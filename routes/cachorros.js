const express = require('express');
const cachorrosController = require('../controllers/cachorrosController');
const exigirLogin = require('../middleware/exigirLogin');
const validarId = require('../middleware/validarId');
const uploadFoto = require('../middleware/uploadFoto');

const router = express.Router();

// Tudo aqui é gerenciamento de pets (funcionários). O login vem ANTES do upload,
// então um visitante anônimo nem consegue fazer o servidor receber arquivos.
router.use(exigirLogin);

router.param('id', validarId);

router.post('/', uploadFoto, cachorrosController.criar);
router.post('/editar/:id', uploadFoto, cachorrosController.editar);
router.post('/disponibilizar/:id', cachorrosController.disponibilizar);
router.post('/excluir/:id', cachorrosController.excluir);

module.exports = router;
