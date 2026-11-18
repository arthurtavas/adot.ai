const express = require('express');

const router = express.Router();

router.use('/', require('./paginas'));          // GET /, GET /loja
router.use('/cachorros', require('./cachorros')); // POST /cachorros, /cachorros/editar/:id, /cachorros/excluir/:id
router.use('/itens', require('./itens'));         // POST /itens, /itens/excluir/:id

module.exports = router;
