const db = require("../../db");
const radius = require("../services/radiusService");

exports.getDashboard = async (req, res) => {
  try {
    const empresaId = req.empresa_id;

    // Pagamentos
    const [[{ total_pagamentos }]] = await db.query(
      "SELECT COUNT(*) as total_pagamentos FROM pagamentos WHERE empresa_id = ?",
      [empresaId]
    );
    const [[{ pagamentos_24h }]] = await db.query(
      "SELECT COUNT(*) as pagamentos_24h FROM pagamentos WHERE empresa_id = ? AND criado_em >= NOW() - INTERVAL 1 DAY",
      [empresaId]
    );

    // Usuários Radius (via radius_users para filtrar por empresa)
    const [[{ total_usuarios }]] = await db.query(
      "SELECT COUNT(*) as total_usuarios FROM radius_users WHERE empresa_id = ?",
      [empresaId]
    );

    // Mikrotiks
    const [[{ total_mikrotiks }]] = await db.query(
      "SELECT COUNT(*) as total_mikrotiks FROM mikrotiks WHERE empresa_id = ?",
      [empresaId]
    );

    // Sessões REAIS (radacct sem acctstoptime) — mesmo critério da tela de Sessões
    const { total: sessoes_ativas, porMikrotik } = await radius.getActiveSessionCounts(empresaId);

    res.json({
      pagamentos: {
        total: total_pagamentos,
        ultimas_24h: pagamentos_24h,
      },
      radius: {
        total_usuarios,
        sessoes_ativas,
      },
      mikrotiks: {
        total: total_mikrotiks,
        online: total_mikrotiks
      },
      sessoes: porMikrotik,
    });
  } catch (err) {
    console.error("Erro no dashboard:", err);
    res.status(500).json({ message: "Erro ao buscar dados do dashboard" });
  }
};
