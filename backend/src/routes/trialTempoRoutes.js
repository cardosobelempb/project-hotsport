const express = require("express");
const router = express.Router();
const { cadastroTrial } = require("../controllers/trialTempoController");

router.post("/cadastro", cadastroTrial);

module.exports = router;
