const db = require("../../db");
const radius = require("../services/radiusService");

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
