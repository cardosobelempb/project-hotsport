const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/campanhasPublicController');

router.get('/popup/mikrotik/:mikrotikId', ctrl.obterPopupPorMikrotik);

router.get('/:portalId', ctrl.obterPorPortal);
router.get('/:portalId/popup', ctrl.obterPopupPorPortal);
router.post('/:portalId/view', ctrl.registrarView);
router.post('/:portalId/evento', ctrl.registrarEvento);
router.post('/:portalId/pesquisa/responder', ctrl.responderPesquisa);

module.exports = router;
