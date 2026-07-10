const db = require("../../db");
const { v4: uuidv4 } = require("uuid");
const { notificarLiberacao } = require("../services/whatsappNotify");
const { criarHotspotUser } = require("../utils/mikrotikClient");
const { verificarLeadExistente } = require("../utils/leadUtils");
const radius = require("../services/radiusService");
const { _buscarCampanhaAtivaDoPortal: buscarCampanhaAtivaDoPortal } = require("./campanhasPublicController");

exports.cadastroCampanha = async (req, res) => {
  try {
    const { nome, telefone, cpf, email, mac, ip, mikrotik_id, portal_id } = req.body;

    if (!mac || !ip) {
      return res.status(400).json({ message: "MAC e IP são obrigatórios" });
    }
    if (!nome || !nome.trim()) {
      return res.status(400).json({ message: "Nome é obrigatório" });
    }

    // Resolver empresa_id via mikrotik_id
    let empresaId = null;
    if (mikrotik_id) {
      const [[mtk]] = await db.execute("SELECT empresa_id FROM mikrotiks WHERE id = ?", [mikrotik_id]);
      empresaId = mtk?.empresa_id || null;
    }

    if (!empresaId) {
      return res.status(400).json({ message: "MikroTik não identificado" });
    }

    // Busca portal campanha_pre_acesso
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
        "SELECT * FROM portais WHERE tipo = 'campanha_pre_acesso' AND empresa_id = ? LIMIT 1",
        [empresaId]
      );
      portal = p || null;
    }

    let cfg = {};
    try { cfg = JSON.parse(portal?.configuracoes || "{}"); } catch (e) {}

    // Campanha elegível do portal (task 012 — rotação round-robin entre
    // campanhas concorrentes, mesma seleção usada no fluxo público normal).
    const campanha = portal ? await buscarCampanhaAtivaDoPortal(portal.id, { mikrotik_id, mac }) : null;

    const acessoDuracaoMin = cfg.acesso_duracao_minutos || 60;
    const campanhaDuracaoSeg = cfg.campanha_duracao_segundos || 30;
    const campanhaModoContagem = !campanha; // sem campanha usa countdown simples

    // Cria lead (pula INSERT se CPF já cadastrado — leads não tem UNIQUE, upsert não funciona)
    const cpfLimpo = radius.normalizeDoc(cpf);
    let leadId = null;
    const leadExistente = cpfLimpo ? await verificarLeadExistente(cpfLimpo, empresaId) : null;
    if (leadExistente) {
      leadId = leadExistente.id;
    } else {
      const [leadResult] = await db.execute(
        `INSERT INTO leads (empresa_id, nome, email, telefone, cpf, mac, ip, origem, lgpd_aceite)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'campanha_pre_acesso', 0)`,
        [empresaId, nome.trim(), email || null, telefone || null, cpfLimpo, mac, ip]
      );
      leadId = leadResult.insertId || null;
    }

    // Gera token com expiração de 15 minutos
    const token = uuidv4().replace(/-/g, "");
    const expiraEm = new Date(Date.now() + 15 * 60 * 1000);

    await db.execute(
      `INSERT INTO pre_acesso_tokens
         (token, empresa_id, portal_id, mikrotik_id, mac, ip, lead_id, cpf, nome, telefone, expira_em)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        token,
        empresaId,
        portal?.id || null,
        mikrotik_id ? parseInt(mikrotik_id) : null,
        mac,
        ip,
        leadId,
        cpfLimpo || null,
        nome.trim(),
        telefone || null,
        expiraEm,
      ]
    );

    // Busca itens da campanha ativa se houver
    let campanhaItens = [];
    if (campanha) {
      const [itens] = await db.execute(
        `SELECT id, tipo, ordem, duracao_segundos, titulo, link_destino, arquivo_url
         FROM campanha_itens
         WHERE campanha_id = ?
         ORDER BY ordem ASC`,
        [campanha.id]
      );
      campanhaItens = itens || [];
    }

    return res.json({
      success: true,
      token,
      acesso_duracao_minutos: acessoDuracaoMin,
      campanha_duracao_segundos: campanhaDuracaoSeg,
      campanha_itens: campanhaItens,
      campanha_modo_contagem: campanhaModoContagem,
    });
  } catch (err) {
    console.error("Erro campanha_pre_acesso/cadastro:", err);
    return res.status(500).json({ message: "Erro interno" });
  }
};

exports.liberarAcesso = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token obrigatório" });
    }

    // Valida token
    const [[tokenRow]] = await db.execute(
      `SELECT * FROM pre_acesso_tokens WHERE token = ? AND usado = 0 AND expira_em > NOW()`,
      [token]
    );

    if (!tokenRow) {
      return res.status(400).json({ message: "Token inválido ou expirado. Refaça o cadastro." });
    }

    const { empresa_id: empresaId, portal_id: portalId, mikrotik_id: mikrotikId, mac, ip, cpf, nome, telefone, lead_id: leadId } = tokenRow;

    // Busca portal e configs
    let portal = null;
    if (portalId) {
      const [[p]] = await db.execute("SELECT * FROM portais WHERE id = ?", [portalId]);
      portal = p || null;
    }

    let cfg = {};
    try { cfg = JSON.parse(portal?.configuracoes || "{}"); } catch (e) {}

    const acessoDuracaoMin = cfg.acesso_duracao_minutos || 60;
    const tempoSeg = acessoDuracaoMin * 60;
    const velDown = cfg.acesso_velocidade_down || 5;
    const velUp = cfg.acesso_velocidade_up || 2;
    const rateLimit = `${velUp}M/${velDown}M`;

    // Username = CPF normalizado (só dígitos) ou MAC — mesma regra dos demais fluxos
    const username = radius.resolveUsername({ cpf, mac }, ["cpf", "mac"]);
    const senha = username;

    await radius.provisionUser({
      username,
      senha,
      empresaId,
      nasId: mikrotikId || null,
      tempoSegundos: tempoSeg,
      rateLimit,
      sharedUsers: 1,
    });

    // Resolve gateway
    let gateway = null;
    if (mikrotikId) {
      const [[m]] = await db.execute("SELECT end_hotspot, ip, usuario, senha, porta FROM mikrotiks WHERE id = ?", [mikrotikId]);
      gateway = m?.end_hotspot || null;
      if (m) {
        criarHotspotUser(m, { username, senha, rateLimit, duracaoMinutos: acessoDuracaoMin })
          .catch(e => console.warn("[campanha_pre_acesso] criarHotspotUser:", e.message));
      }
    }

    // Marca token como usado
    await db.execute("UPDATE pre_acesso_tokens SET usado = 1 WHERE token = ?", [token]);

    // Notificação WhatsApp
    const loginUrl = gateway ? `http://${gateway}/login?username=${username}&password=${senha}` : "";
    notificarLiberacao({
      empresa_id: empresaId,
      portal_id: portalId || null,
      mikrotik_id: mikrotikId || null,
      telefone: telefone || null,
      cpf: cpf || null,
      mac,
      contexto_tipo: "campanha_pre_acesso",
      vars: {
        nome: nome || null,
        username,
        password: senha,
        plano: `Acesso ${acessoDuracaoMin} min`,
        duracao: acessoDuracaoMin,
        velocidade: `${velDown}M/${velUp}M`,
        login_url: loginUrl,
        cpf: cpf || "",
      },
    }).catch(e => console.warn("[campanha_pre_acesso] notificarLiberacao:", e.message));

    return res.json({ success: true, gateway, username, password: senha });
  } catch (err) {
    console.error("Erro campanha_pre_acesso/liberar:", err);
    return res.status(500).json({ message: "Erro interno" });
  }
};
