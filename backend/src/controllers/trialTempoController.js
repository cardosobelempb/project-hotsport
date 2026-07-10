const db = require("../../db");
const { notificarLiberacao } = require("../services/whatsappNotify");
const { criarHotspotUser } = require("../utils/mikrotikClient");
const radius = require("../services/radiusService");

exports.cadastroTrial = async (req, res) => {
  try {
    const { nome, telefone, cpf, email, mac, ip, mikrotik_id, portal_id } = req.body;

    if (!mac || !ip) {
      return res.status(400).json({ message: "MAC e IP são obrigatórios" });
    }

    // Resolver empresa_id via mikrotik_id
    let empresaId = null;
    let mtkRow = null;
    if (mikrotik_id) {
      const [[mtk]] = await db.execute(
        "SELECT empresa_id, end_hotspot FROM mikrotiks WHERE id = ?",
        [mikrotik_id]
      );
      mtkRow = mtk || null;
      empresaId = mtk?.empresa_id || null;
    }

    if (!empresaId) {
      return res.status(400).json({ message: "MikroTik não identificado" });
    }

    // Busca portal trial_tempo (por portal_id explícito ou pelo tipo na empresa)
    let portal = null;
    if (portal_id) {
      const [[p]] = await db.execute(
        "SELECT * FROM portais WHERE id = ? AND empresa_id = ?",
        [portal_id, empresaId]
      );
      portal = p || null;
    }
    if (!portal) {
      const [[p]] = await db.execute(
        "SELECT * FROM portais WHERE tipo = 'trial_tempo' AND empresa_id = ? LIMIT 1",
        [empresaId]
      );
      portal = p || null;
    }

    // Config do portal
    let cfg = {};
    try { cfg = JSON.parse(portal?.configuracoes || "{}"); } catch (e) {}

    const trialDuracaoMin = cfg.trial_duracao_minutos || 3;
    const trialTempoSeg = trialDuracaoMin * 60;
    const velDown = cfg.trial_velocidade_down || 2;
    const velUp = cfg.trial_velocidade_up || 2;
    const rateLimit = `${velUp}M/${velDown}M`;
    const oferecePlanosTrial = !!cfg.oferecer_planos;

    // Username = CPF limpo ou MAC
    const cpfLimpo = radius.normalizeDoc(cpf);
    const username = radius.resolveUsername({ cpf, mac }, ["cpf", "mac"]);
    const senha = username;

    // Verificar se MAC já tem sessão RADIUS ativa (trial ainda rodando)
    const sessaoAtiva = await radius.hasActiveSessionByMac(mac);

    if (sessaoAtiva) {
      // Trial ainda em andamento — resolve gateway e retorna credenciais
      let gateway = mtkRow?.end_hotspot || null;
      if (!gateway && mikrotik_id) {
        const [[m]] = await db.execute("SELECT end_hotspot FROM mikrotiks WHERE id = ?", [mikrotik_id]);
        gateway = m?.end_hotspot || null;
      }
      const [[leadAtivo]] = await db.execute(
        "SELECT id FROM leads WHERE mac = ? AND empresa_id = ? AND origem = 'trial_tempo' LIMIT 1",
        [mac, empresaId]
      );
      return res.json({
        success: true,
        gateway,
        username,
        password: senha,
        trial_duracao_minutos: trialDuracaoMin,
        cliente_id: leadAtivo?.id || null,
        oferece_planos: oferecePlanosTrial,
      });
    }

    // Verificar se já usou o trial
    const [[leadTrial]] = await db.execute(
      "SELECT id FROM leads WHERE mac = ? AND empresa_id = ? AND origem = 'trial_tempo' LIMIT 1",
      [mac, empresaId]
    );

    if (leadTrial) {
      // Trial já foi usado e expirou — informar frontend
      let destinoUrl = null;
      const destPortalId = cfg.trial_destino_portal_id;
      if (destPortalId) {
        const [[dest]] = await db.execute("SELECT url_redirect FROM portais WHERE id = ?", [destPortalId]);
        destinoUrl = dest?.url_redirect || null;
      }
      if (!destinoUrl) {
        const [[planos]] = await db.execute(
          "SELECT url_redirect FROM portais WHERE empresa_id = ? AND tipo = 'planos' LIMIT 1",
          [empresaId]
        );
        destinoUrl = planos?.url_redirect || "/planos-cliente";
      }
      return res.json({ success: false, trial_expirado: true, destino_url: destinoUrl });
    }

    // Primeira vez — cria lead e RADIUS
    const [leadResult] = await db.execute(
      `INSERT INTO leads (empresa_id, nome, email, telefone, cpf, mac, ip, origem, lgpd_aceite)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'trial_tempo', 0)`,
      [empresaId, nome || null, email || null, telefone || null, cpf || null, mac, ip]
    );

    // Cria credenciais RADIUS (sem limparSessoesDoDia: trial depende do radacct
    // do dia para detectar trial em andamento)
    const nasId = mikrotik_id ? parseInt(mikrotik_id) : null;
    await radius.provisionUser({
      username,
      senha,
      empresaId,
      nasId,
      tempoSegundos: trialTempoSeg,
      rateLimit,
      sharedUsers: 1,
    });

    // Resolve gateway
    let gateway = mtkRow?.end_hotspot || null;
    if (!gateway && mikrotik_id) {
      const [[m]] = await db.execute("SELECT end_hotspot FROM mikrotiks WHERE id = ?", [mikrotik_id]);
      gateway = m?.end_hotspot || null;
    }

    // Cria hotspot user no MikroTik (fire-and-forget)
    if (mikrotik_id) {
      db.execute("SELECT ip, usuario, senha, porta FROM mikrotiks WHERE id = ?", [mikrotik_id])
        .then(([[mtkConn]]) => {
          if (mtkConn) criarHotspotUser(mtkConn, { username, senha, rateLimit, duracaoMinutos: trialDuracaoMin });
        })
        .catch(e => console.warn("[trialTempo] criarHotspotUser:", e.message));
    }

    // Notificação WhatsApp
    const loginUrl = gateway ? `http://${gateway}/login?username=${username}&password=${senha}` : "";
    notificarLiberacao({
      empresa_id: empresaId,
      portal_id: portal?.id || null,
      mikrotik_id: mikrotik_id ? parseInt(mikrotik_id) : null,
      telefone: telefone || null,
      cpf: cpfLimpo || null,
      mac,
      contexto_tipo: "trial_tempo",
      vars: {
        nome: nome || null,
        username,
        password: senha,
        plano: `Trial ${trialDuracaoMin} min`,
        duracao: trialDuracaoMin,
        velocidade: `${velDown}M/${velUp}M`,
        login_url: loginUrl,
        cpf: cpfLimpo || "",
      },
    }).catch(e => console.warn("[trialTempo] notificarLiberacao:", e.message));

    return res.json({
      success: true,
      gateway,
      username,
      password: senha,
      trial_duracao_minutos: trialDuracaoMin,
      cliente_id: leadResult.insertId,
      oferece_planos: oferecePlanosTrial,
    });
  } catch (err) {
    console.error("Erro trial_tempo/cadastro:", err);
    return res.status(500).json({ message: "Erro interno" });
  }
};
