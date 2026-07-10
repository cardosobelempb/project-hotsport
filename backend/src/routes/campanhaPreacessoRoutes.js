const express = require("express");
const router = express.Router();
const { cadastroCampanha, liberarAcesso } = require("../controllers/campanhaPreacessoController");

router.post("/cadastro", cadastroCampanha);
router.post("/liberar", liberarAcesso);

module.exports = router;
