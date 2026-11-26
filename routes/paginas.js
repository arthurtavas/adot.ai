const express = require('express');
const paginasController = require('../controllers/paginasController');
const exigirLogin = require('../middleware/exigirLogin');

const router = express.Router();

router.get('/', paginasController.vitrine);
router.get('/loja', exigirLogin, paginasController.loja);

module.exports = router;
