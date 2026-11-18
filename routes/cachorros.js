const express = require('express');
const cachorrosController = require('../controllers/cachorrosController');
const validarId = require('../middleware/validarId');
const uploadFoto = require('../middleware/uploadFoto');

const router = express.Router();

router.param('id', validarId);

router.post('/', uploadFoto, cachorrosController.criar);
router.post('/editar/:id', uploadFoto, cachorrosController.editar);
router.post('/excluir/:id', cachorrosController.excluir);

module.exports = router;
