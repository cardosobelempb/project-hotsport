const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/bannersController");
const { uploadBanner } = require("../middleware/uploadBanner");

router.get("/", ctrl.listar);
router.post("/", uploadBanner.single("imagem"), ctrl.criar);
router.put("/:id", ctrl.atualizar);
router.delete("/:id", ctrl.deletar);

module.exports = router;
