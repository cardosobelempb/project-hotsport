const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/portalTemplateController");

router.get("/", ctrl.listarTemplates);
router.get("/:id", ctrl.obterTemplate);
router.post("/", ctrl.criarTemplate);
router.put("/:id", ctrl.atualizarTemplate);
router.delete("/:id", ctrl.deletarTemplate);

module.exports = router;
