const express = require('express');
const interessadosController = require('../controllers/interessadosController');
const exigirLogin = require('../middleware/exigirLogin');
const validarId = require('../middleware/validarId');
const { limiteInteresse } = require('../middleware/limitadores');

const router = express.Router();

router.param('id', validarId);

router.post('/', limiteInteresse, interessadosController.criar);             // público (cliente), com limite por IP
router.post('/excluir/:id', exigirLogin, interessadosController.excluir);    // somente funcionários

module.exports = router;
