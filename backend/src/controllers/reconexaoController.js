const db = require("../../db");
const radius = require("../services/radiusService");
const { criarHotspotUser } = require("../utils/mikrotikClient");

// Saldo de tempo diario do cliente (identificado por MAC) — usado pela pagina
// /acesso-ativo: se o cliente reconecta ao WiFi e ainda tem tempo, mostra as
// informacoes e o botao de conectar em vez do portal de cadastro.
exports.verificarSaldo = async (req, res) => {
  const { mac, mikrotik_id } = req.query;

  if (!mac || !mikrotik_id) {
    return res.json({ tem_saldo: false });
  }

  try {
    const [[mtk]] = await db.execute(
      "SELECT empresa_id, end_hotspot, ip FROM mikrotiks WHERE id = ?",
      [mikrotik_id]
    );
    if (!mtk?.empresa_id) return res.json({ tem_saldo: false });

    const saldo = await radius.getAccessBalanceByMac({ mac, empresaId: mtk.empresa_id });
    if (!saldo) return res.json({ tem_saldo: false });

    const [[empresa]] = await db.execute(
      "SELECT nome, logo_url FROM empresas WHERE id = ?",
      [mtk.empresa_id]
    );

    return res.json({
      tem_saldo: true,
      username: saldo.username,
      password: saldo.password,
      restante_segundos: saldo.restanteSegundos,
      max_diario_segundos: saldo.maxDiarioSegundos,
      usado_hoje_segundos: saldo.usadoHojeSegundos,
      gateway: mtk.end_hotspot || mtk.ip || null,
      nome: saldo.lead?.nome || null,
      empresa_nome: empresa?.nome || null,
      empresa_logo: empresa?.logo_url || null,
    });
  } catch (err) {
    console.error("Erro verificarSaldo:", err);
    return res.json({ tem_saldo: false });
  }
};

// Reconecta um cliente que ainda tem saldo diario: RE-CRIA o usuario local
// no hotspot do MikroTik antes de devolver as credenciais pro frontend
// redirecionar. So ter RADIUS (radcheck/radreply) nao basta nesse ambiente —
// se o hotspot user local sumiu do roteador (uptime anterior esgotou,
// reboot, limpeza), o login em /login falha e o cliente cai num loop de
// volta pro /hotspot/redirect (RADIUS "com saldo" mas nunca autentica de
// verdade no MikroTik). Ver criarHotspotUser em utils/mikrotikClient.js.
exports.reconectar = async (req, res) => {
  const { mac, mikrotik_id } = req.body || {};

  if (!mac || !mikrotik_id) {
    return res.status(400).json({ success: false, message: "Dados incompletos" });
  }

  try {
    const [[mtk]] = await db.execute(
      "SELECT empresa_id, end_hotspot, ip, vpn_ip, usuario, senha, porta FROM mikrotiks WHERE id = ?",
      [mikrotik_id]
    );
    if (!mtk?.empresa_id) {
      return res.status(404).json({ success: false, message: "MikroTik não encontrado" });
    }

    const saldo = await radius.getAccessBalanceByMac({ mac, empresaId: mtk.empresa_id });
    if (!saldo) {
      return res.status(409).json({ success: false, message: "Seu tempo gratuito de hoje acabou" });
    }

    const [[reply]] = await db.execute(
      "SELECT value FROM radreply WHERE username = ? AND attribute = 'Mikrotik-Rate-Limit' LIMIT 1",
      [saldo.username]
    );
    const rateLimit = reply?.value || "2M/2M";
    const gateway = mtk.end_hotspot || mtk.ip || null;

    if (!mtk.ip) {
      return res.status(500).json({ success: false, message: "MikroTik sem IP de gerência configurado" });
    }

    const resultado = await criarHotspotUser(
      { ip: mtk.ip, vpn_ip: mtk.vpn_ip, usuario: mtk.usuario, senha: mtk.senha, porta: mtk.porta },
      {
        username: saldo.username,
        senha: saldo.password,
        rateLimit,
        duracaoMinutos: Math.max(1, Math.ceil(saldo.restanteSegundos / 60)),
      }
    );

    if (!resultado.ok) {
      return res.status(502).json({
        success: false,
        message: "Não foi possível liberar a conexão no roteador. Tente novamente em instantes.",
      });
    }

    return res.json({
      success: true,
      gateway,
      username: saldo.username,
      password: saldo.password,
    });
  } catch (err) {
    console.error("Erro reconectar:", err);
    return res.status(500).json({ success: false, message: "Erro interno ao reconectar" });
  }
};

exports.buscarUsuarioPorMac = async (req, res) => {
  const { mac, empresa_id } = req.query;

  if (!mac || !empresa_id) {
    return res.json({ encontrado: false });
  }

  try {
    const macNorm = String(mac).toLowerCase();

    // Busca lead mais recente com esse MAC na empresa
    const [[lead]] = await db.execute(
      `SELECT id AS cliente_id, nome, cpf, telefone, email
       FROM leads
       WHERE LOWER(REPLACE(REPLACE(mac, ':', ''), '-', '')) = REPLACE(REPLACE(?, ':', ''), '-', '')
         AND empresa_id = ?
       ORDER BY criado_em DESC LIMIT 1`,
      [macNorm, empresa_id]
    );

    if (!lead) {
      return res.json({ encontrado: false });
    }

    return res.json({
      encontrado: true,
      cliente_id: lead.cliente_id,
      nome: lead.nome,
      cpf: lead.cpf,
      telefone: lead.telefone,
    });
  } catch (err) {
    console.error("Erro buscarUsuarioPorMac:", err);
    return res.json({ encontrado: false });
  }
};
