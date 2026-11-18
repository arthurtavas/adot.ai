const express = require('express');
const paginasController = require('../controllers/paginasController');

const router = express.Router();

router.get('/', paginasController.vitrine);
router.get('/loja', paginasController.loja);

module.exports = router;
