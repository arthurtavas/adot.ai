const express = require('express');
const authController = require('../controllers/authController');
const { limiteLogin } = require('../middleware/limitadores');

const router = express.Router();

router.get('/login', authController.formulario);
router.post('/login', limiteLogin, authController.entrar);
router.post('/logout', authController.sair);

module.exports = router;
