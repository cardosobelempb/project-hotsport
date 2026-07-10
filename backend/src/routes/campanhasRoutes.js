const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/campanhasController');
const { uploadCampanha } = require('../middleware/uploadCampanha');

// CRUD campanhas
router.get('/', ctrl.listar);
router.post('/', ctrl.criar);

// IMPORTANT: declare /metricas BEFORE /:id to avoid Express capturing "metricas" as id
router.get('/metricas', ctrl.metricasGerais);

router.get('/:id', ctrl.obter);
router.put('/:id', ctrl.atualizar);
router.delete('/:id', ctrl.deletar);
router.get('/:id/metricas', ctrl.metricasCampanha);

// IMPORTANT: declare /reordenar BEFORE /:itemId to avoid Express capturing "reordenar" as itemId
router.put('/:id/itens/reordenar', ctrl.reordenar);

// Itens
router.post('/:id/itens/adsense', ctrl.criarItemAdsense);
router.post('/:id/itens/youtube', ctrl.criarItemYoutube);
router.post('/:id/itens/afiliado', ctrl.criarItemAfiliado);
router.post('/:id/itens/cupom', ctrl.criarItemCupom);
router.post('/:id/itens/pesquisa', ctrl.criarItemPesquisa);
router.post('/:id/itens', uploadCampanha.single('arquivo'), ctrl.uploadItem);
router.put('/:id/itens/:itemId', ctrl.atualizarItem);
router.delete('/:id/itens/:itemId', ctrl.deletarItem);

module.exports = router;
