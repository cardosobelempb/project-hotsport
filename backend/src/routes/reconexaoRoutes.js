const express = require('express');
const router = express.Router();
const { buscarUsuarioPorMac, verificarSaldo } = require('../controllers/reconexaoController');

router.get('/buscar-usuario', buscarUsuarioPorMac);
router.get('/saldo', verificarSaldo);

module.exports = router;
