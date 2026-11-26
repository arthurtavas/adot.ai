const express = require('express');

const router = express.Router();

router.use('/', require('./auth'));               // GET/POST /login, POST /logout
router.use('/', require('./paginas'));            // GET / (público), GET /loja (protegida)
router.use('/cachorros', require('./cachorros')); // TODAS protegidas: POST /cachorros, /editar/:id, /excluir/:id
router.use('/itens', require('./itens'));         // POST /itens (público, com limite), POST /itens/excluir/:id (protegida)

module.exports = router;
