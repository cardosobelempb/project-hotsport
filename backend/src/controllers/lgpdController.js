const db = require("../../db");
const { verificarLeadExistente, verificarLeadExistentePorContato } = require("../utils/leadUtils");
const { notificarLiberacao } = require("../services/whatsappNotify");
const { criarHotspotUser } = require("../utils/mikrotikClient");
const radius = require("../services/radiusService");

exports.lgpdLogin = async (req, res) => {
  try {
    const { cpf, aceite, mac, ip, email, nome, telefone, mikrotik_id } = req.body;

    if (aceite === undefined || !mac || !ip) {
      return res.status(400).json({ message: "Dados obrigatórios faltando" });
    }

    // Resolver empresa_id via mikrotik_id (endpoint público)
    let empresaId = null;
    if (mikrotik_id) {
      const [[mtk]] = await db.execute("SELECT empresa_id FROM mikrotiks WHERE id = ?", [mikrotik_id]);
      empresaId = mtk?.empresa_id || null;
    }

    const aceiteInt = aceite ? 1 : 0;
    const cpfLimpo = radius.normalizeDoc(cpf);

    if (!empresaId) {
      return res.status(400).json({ message: "MikroTik não identificado. Acesse pelo portal correto." });
    }

    // Busca plano LGPD da empresa (LEFT JOIN: funciona mesmo com mikrotik_id=0 no seed)
    let planoQuery = `
      SELECT p.id, p.duracao_minutos, p.velocidade_down, p.velocidade_up, p.mikrotik_id, p.shared_users, m.end_hotspot, m.ip
      FROM planos p
      LEFT JOIN mikrotiks m ON p.mikrotik_id = m.id
      WHERE LOWER(p.nome) = 'lgpd'`;
    const planoParams = [];

    if (empresaId) {
      planoQuery += ` AND p.empresa_id = ?`;
      planoParams.push(empresaId);
    }

    planoQuery += ` LIMIT 1`;
    const [[plano]] = await db.query(planoQuery, planoParams);

    if (!plano) {
      return res.status(404).json({ message: "Plano LGPD não configurado" });
    }

    // Salvar na tabela leads (permite reconexão: pula INSERT se já existe
    // por CPF, telefone ou email)
    let leadExistente = await verificarLeadExistentePorContato({ cpf: cpfLimpo, telefone, email, empresaId });

    let leadId = leadExistente?.id || null;
    if (!leadExistente) {
      const [insertLead] = await db.execute(
        `INSERT INTO leads (empresa_id, nome, email, telefone, cpf, mac, ip, origem, lgpd_aceite, lgpd_aceite_em)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'lgpd', ?, NOW())`,
        [empresaId, nome || null, email || null, telefone || null, cpf || null, mac, ip, aceiteInt]
      );
      leadId = insertLead.insertId;
    }

    // Username RADIUS: reusa conta existente do cliente (CPF/telefone/MAC via
    // radius_users ou leads), senão CPF limpo ou MAC
    const contaExistente = await radius.findExistingUser({ cpf, telefone, mac, empresaId });
    const username = contaExistente?.username || radius.resolveUsername({ cpf, mac }, ["cpf", "mac"]);
    const senha = username;

    const rateLimit = `${plano.velocidade_up}M/${plano.velocidade_down}M`;
    const tempoSegundos = plano.duracao_minutos * 60;
    const sharedUsers = plano.shared_users || 1;

    // nas_id: usa mikrotik do plano; fallback no mikrotik da requisição (plano.mikrotik_id pode ser 0)
    const nasIdLgpd = plano.mikrotik_id || (mikrotik_id ? parseInt(mikrotik_id) : null);

    await radius.provisionUser({
      username,
      senha,
      empresaId,
      planoId: plano.id,
      grupoId: plano.id,
      nasId: nasIdLgpd,
      tempoSegundos,
      rateLimit,
      sharedUsers,
      limparSessoesDoDia: true,
    });

    // Resolve gateway pelo end_hotspot do plano (fallback: ip de gerencia do
    // mikrotik do plano), senão busca do mikrotik da requisição.
    // NUNCA usa a variavel `ip` (IP do cliente) como fallback aqui.
    let gateway = plano.end_hotspot || plano.ip || null;
    const mtkIdConexao = nasIdLgpd && nasIdLgpd > 0 ? nasIdLgpd : (mikrotik_id ? parseInt(mikrotik_id) : null);
    if (mtkIdConexao && !gateway) {
      try {
        const [[reqMtk]] = await db.execute("SELECT end_hotspot, ip FROM mikrotiks WHERE id = ?", [mtkIdConexao]);
        gateway = reqMtk?.end_hotspot || reqMtk?.ip || null;
      } catch (_) {}
    }
    const loginUrl = gateway ? `http://${gateway}/login?username=${username}&password=${senha}` : "";

    // Criar hotspot user no MikroTik com rate-limit do plano (fire-and-forget)
    if (mtkIdConexao) {
      db.execute("SELECT ip, usuario, senha, porta FROM mikrotiks WHERE id = ?", [mtkIdConexao])
        .then(([[mtkRow]]) => {
          if (mtkRow) criarHotspotUser(mtkRow, { username, senha, rateLimit, duracaoMinutos: plano.duracao_minutos });
        })
        .catch(e => console.warn("[lgpd] criarHotspotUser:", e.message));
    }

    // Resolver portal_id LGPD da empresa (notificacao WhatsApp + toggle "oferecer planos")
    let portalId = null;
    let oferecePlanos = false;
    if (empresaId) {
      try {
        const [[portalLgpd]] = await db.execute(
          "SELECT id, configuracoes FROM portais WHERE tipo = 'lgpd' AND empresa_id = ? LIMIT 1",
          [empresaId]
        );
        portalId = portalLgpd?.id || null;
        if (portalLgpd?.configuracoes) {
          try { oferecePlanos = !!JSON.parse(portalLgpd.configuracoes).oferecer_planos; } catch (_) {}
        }
      } catch (_) {}
    }

    notificarLiberacao({
      empresa_id: empresaId,
      portal_id: portalId,
      mikrotik_id: plano.mikrotik_id,
      telefone: telefone || null,
      cpf: cpfLimpo || null,
      mac,
      contexto_tipo: "lgpd",
      vars: {
        nome: nome || null,
        username,
        password: senha,
        plano: "LGPD",
        duracao: plano.duracao_minutos,
        velocidade: `${plano.velocidade_down}M/${plano.velocidade_up}M`,
        login_url: loginUrl,
        cpf: cpfLimpo || "",
      },
    }).catch(err => console.warn("[lgpdLogin] notificarLiberacao falhou:", err.message));

    return res.json({
      success: true,
      gateway,
      username,
      password: senha,
      ja_cadastrado: !!leadExistente,
      nome_existente: leadExistente?.nome || null,
      cliente_id: leadId,
      oferece_planos: oferecePlanos,
    });
  } catch (err) {
    console.error("Erro LGPD Login:", err);
    return res.status(500).json({ message: "Erro interno ao processar login LGPD" });
  }
};

exports.getAllLgpd = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, cpf, email, nome, telefone, mac, ip, lgpd_aceite as aceite, criado_em FROM leads WHERE empresa_id = ? AND origem = 'lgpd' ORDER BY criado_em DESC",
      [req.empresa_id]
    );
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar cadastros LGPD:", err);
    res.status(500).json({ message: "Erro ao buscar dados LGPD" });
  }
};

exports.lgpdCadastro = async (req, res) => {
  try {
    const { cpf, aceite, mac, ip, nome, telefone, email, mikrotik_id } = req.body;

    if (!cpf || aceite === undefined) {
      return res.status(400).json({ message: "CPF e aceite são obrigatórios" });
    }

    let empresaId = null;
    if (mikrotik_id) {
      const [[mtk]] = await db.execute("SELECT empresa_id FROM mikrotiks WHERE id = ?", [mikrotik_id]);
      empresaId = mtk?.empresa_id || null;
    }

    if (!empresaId) {
      return res.status(400).json({ message: "MikroTik não identificado. Acesse pelo portal correto." });
    }

    const aceiteInt = aceite ? 1 : 0;

    // Verificar lead duplicado por CPF
    if (cpf) {
      const cpfCheck = cpf.replace(/\D/g, "");
      const existing = await verificarLeadExistente(cpfCheck, empresaId);
      if (existing) {
        return res.status(409).json({ message: "Este CPF já está cadastrado em nosso sistema.", duplicado: true });
      }
    }

    await db.execute(
      `INSERT INTO leads (empresa_id, nome, email, telefone, cpf, mac, ip, origem, lgpd_aceite, lgpd_aceite_em)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'lgpd', ?, NOW())`,
      [empresaId, nome || null, email || null, telefone || null, cpf, mac || null, ip || null, aceiteInt]
    );

    res.json({ success: true, message: "Cadastro LGPD realizado com sucesso" });
  } catch (err) {
    console.error("Erro ao cadastrar LGPD:", err);
    res.status(500).json({ message: "Erro interno ao cadastrar LGPD" });
  }
};
