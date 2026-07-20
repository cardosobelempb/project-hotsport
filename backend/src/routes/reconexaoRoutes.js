const express = require('express');
const router = express.Router();
const { buscarUsuarioPorMac, verificarSaldo, reconectar } = require('../controllers/reconexaoController');

router.get('/buscar-usuario', buscarUsuarioPorMac);
router.get('/saldo', verificarSaldo);
router.post('/reconectar', reconectar);

module.exports = router;
