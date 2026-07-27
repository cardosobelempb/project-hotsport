const express = require('express');
const router = express.Router();
const { criarUsuarioRadius, vincularPlano, listarUsuarios, obterUsuario, atualizarUsuario, deletarUsuarioRadius, listarSessoesAtivas, desconectarSessao, verificarStatusRadius, diagnosticarRadius } = require('../controllers/radiusController');
const checkPermissao = require('../middleware/checkPermissao');

// Rotas protegidas
router.get('/status', checkPermissao('radius'), verificarStatusRadius);
router.get('/diagnostico', checkPermissao('radius'), diagnosticarRadius);
router.post('/criar-usuario', checkPermissao('radius'), criarUsuarioRadius);
router.post('/vincular-plano', checkPermissao('radius'), vincularPlano);
router.get('/usuarios', checkPermissao('radius'), listarUsuarios);
router.get('/usuarios/:username', checkPermissao('radius'), obterUsuario);
router.put('/usuarios/:username', checkPermissao('radius'), atualizarUsuario);
router.delete('/usuarios/:username', checkPermissao('radius'), deletarUsuarioRadius);
router.get('/sessoes', checkPermissao('sessoes'), listarSessoesAtivas);
router.post('/desconectar', checkPermissao('sessoes'), desconectarSessao);

module.exports = router;
