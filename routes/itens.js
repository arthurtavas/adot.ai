const express = require('express');
const interessadosController = require('../controllers/interessadosController');
const validarId = require('../middleware/validarId');

const router = express.Router();

router.param('id', validarId);

router.post('/', interessadosController.criar);
router.post('/excluir/:id', interessadosController.excluir);

module.exports = router;
