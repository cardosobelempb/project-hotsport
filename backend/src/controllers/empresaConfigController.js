const db = require("../../db");
const axios = require("axios");

// Programas de afiliado suportados (task 008) — cada um vira um config_type
// próprio em empresa_configs (mesmo padrão de credencial por tenant já usado
// por mercadopago/efi/whatsapp), permitindo múltiplos programas ativos ao
// mesmo tempo pra uma mesma empresa.
const PROGRAMAS_AFILIADO = [
  "afiliado_mercadolivre", "afiliado_amazon", "afiliado_shopee",
  "afiliado_hotmart", "afiliado_eduzz", "afiliado_monetizze",
  "afiliado_braip", "afiliado_awin", "afiliado_cj",
];
const CONFIG_TYPES = ["mercadopago", "efi", "whatsapp", ...PROGRAMAS_AFILIADO];

// GET /api/empresa-config/:tipo
exports.obterConfig = async (req, res) => {
  try {
    const { tipo } = req.params;
    const validTypes = CONFIG_TYPES;
    if (!validTypes.includes(tipo)) {
      return res.status(400).json({ message: "Tipo de configuração inválido" });
    }

    const [[config]] = await db.execute(
      "SELECT config_json FROM empresa_configs WHERE empresa_id = ? AND config_type = ?",
      [req.empresa_id, tipo]
    );

    if (!config) {
      return res.json({});
    }

    const parsed = typeof config.config_json === "string"
      ? JSON.parse(config.config_json)
      : config.config_json;

    res.json(parsed);
  } catch (err) {
    console.error("Erro ao obter config:", err);
    res.status(500).json({ message: "Erro ao obter configuração" });
  }
};

// POST /api/empresa-config/:tipo
exports.salvarConfig = async (req, res) => {
  try {
    const { tipo } = req.params;
    const validTypes = CONFIG_TYPES;
    if (!validTypes.includes(tipo)) {
      return res.status(400).json({ message: "Tipo de configuração inválido" });
    }

    const configJson = JSON.stringify(req.body);

    await db.execute(
      `INSERT INTO empresa_configs (empresa_id, config_type, config_json)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE config_json = VALUES(config_json), atualizado_em = CURRENT_TIMESTAMP`,
      [req.empresa_id, tipo, configJson]
    );

    res.json({ success: true, message: "Configuração salva com sucesso" });
  } catch (err) {
    console.error("Erro ao salvar config:", err);
    res.status(500).json({ message: "Erro ao salvar configuração" });
  }
};

// POST /api/empresa-config/mercadopago/testar
exports.testarConexaoMercadoPago = async (req, res) => {
  try {
    const [[config]] = await db.execute(
      "SELECT config_json FROM empresa_configs WHERE empresa_id = ? AND config_type = 'mercadopago'",
      [req.empresa_id]
    );

    if (!config) {
      return res.status(400).json({ message: "Configuração do Mercado Pago não encontrada" });
    }

    const parsed = typeof config.config_json === "string"
      ? JSON.parse(config.config_json)
      : config.config_json;

    if (!parsed.access_token) {
      return res.status(400).json({ message: "Access Token não configurado" });
    }

    const response = await axios.get("https://api.mercadopago.com/users/me", {
      headers: { Authorization: `Bearer ${parsed.access_token}` },
    });

    res.json({ success: true, usuario: response.data });
  } catch (err) {
    console.error("Erro ao testar conexão MP:", err.message);
    res.status(500).json({ message: "Falha na comunicação com Mercado Pago. Verifique o Access Token." });
  }
};

exports.PROGRAMAS_AFILIADO = PROGRAMAS_AFILIADO;
