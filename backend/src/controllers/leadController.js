const db = require("../../db");
const { verificarLeadExistente, verificarLeadExistentePorContato } = require("../utils/leadUtils");
const { notificarLiberacao } = require("../services/whatsappNotify");
const { criarHotspotUser } = require("../utils/mikrotikClient");
const radius = require("../services/radiusService");

// Captura passiva de lead + libera internet via plano "Lead"
exports.capturaPassiva = async (req, res) => {
  try {
    const { nome, email, telefone, cpf, mac, ip, mikrotik_id } = req.body;

    if (!telefone && !email) {
      return res.status(400).json({ message: "Telefone ou email são obrigatórios" });
    }

    let empresaId = null;
    if (mikrotik_id) {
      const [[mtk]] = await db.execute("SELECT empresa_id FROM mikrotiks WHERE id = ?", [mikrotik_id]);
      empresaId = mtk?.empresa_id || null;
    }

    const cpfLimpo = cpf ? cpf.replace(/\D/g, "") : null;

    // Salvar lead (permite reconexão: pula INSERT se já existe por CPF,
    // telefone ou email — CPF é opcional nesse portal, então checar só CPF
    // fazia toda reconexão sem CPF preenchido virar linha nova duplicada)
    const existingLeadPassivo = await verificarLeadExistentePorContato({ cpf: cpfLimpo, telefone, email, empresaId });
    if (!existingLeadPassivo) {
      await db.execute(
        `INSERT INTO leads (empresa_id, nome, email, telefone, cpf, mac, ip, origem, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'portal_passivo', 'novo')`,
        [empresaId, nome || null, email || null, telefone || null, cpfLimpo, mac || null, ip || null]
      );
    } else {
      // Atualiza os dados do lead existente (mesmo raciocinio do cadastroCliente
      // abaixo: sem isso, reconexoes sempre usariam nome/cpf/mac do 1o cadastro)
      try {
        await db.execute(
          `UPDATE leads SET
             nome = COALESCE(?, nome),
             cpf = COALESCE(?, cpf),
             mac = COALESCE(?, mac),
             ip = COALESCE(?, ip)
           WHERE id = ?`,
          [nome || null, cpfLimpo, mac || null, ip || null, existingLeadPassivo.id]
        );
      } catch (updErr) {
        console.warn("[capturaPassiva] falha ao atualizar lead existente:", updErr.message);
      }
    }

    // Buscar config de redirect do portal lead_passivo desta empresa
    let redirectUrl = null;
    let redirectDelay = 3;
    let portalIdPassivo = null;
    if (empresaId) {
      const [[portal]] = await db.execute(
        "SELECT id, configuracoes FROM portais WHERE tipo = 'lead_passivo' AND empresa_id = ? LIMIT 1",
        [empresaId]
      );
      portalIdPassivo = portal?.id || null;
      if (portal?.configuracoes) {
        try {
          const cfg = JSON.parse(portal.configuracoes);
          if (cfg.redirect_portal_url) {
            redirectUrl = cfg.redirect_portal_url;
            redirectDelay = cfg.redirect_delay || 3;
          }
        } catch (e) {}
      }
    }

    // Tentar liberar acesso via plano Lead
    let gateway = null;
    let username = null;
    let senha = null;

    // Reusa conta existente do cliente (telefone/email/MAC/CPF), senão telefone > email > MAC
    const contaPassiva = await radius.findExistingUser({ cpf, telefone, email, mac, empresaId });
    const usernamePassivo = contaPassiva?.username
      || radius.resolveUsername({ telefone, email, mac }, ["telefone", "email", "mac"]);

    if (usernamePassivo) {
      username = usernamePassivo;
      senha = username;

      let planoQuery = `
        SELECT p.id, p.duracao_minutos, p.velocidade_down, p.velocidade_up, p.mikrotik_id, p.shared_users, m.end_hotspot, m.ip
        FROM planos p
        LEFT JOIN mikrotiks m ON p.mikrotik_id = m.id
        WHERE LOWER(p.nome) = 'lead'`;
      const planoParams = [];
      if (empresaId) {
        planoQuery += ` AND p.empresa_id = ?`;
        planoParams.push(empresaId);
      }
      planoQuery += ` LIMIT 1`;

      try {
        const [[plano]] = await db.query(planoQuery, planoParams);
        if (plano) {
          const rateLimit = `${plano.velocidade_up}M/${plano.velocidade_down}M`;
          const tempoSegundos = plano.duracao_minutos * 60;
          const sharedUsers = plano.shared_users || 1;

          const nasIdPassivo = plano.mikrotik_id || (mikrotik_id ? parseInt(mikrotik_id) : null);
          await radius.provisionUser({
            username,
            senha,
            empresaId,
            planoId: plano.id,
            grupoId: plano.id,
            nasId: nasIdPassivo,
            tempoSegundos,
            rateLimit,
            sharedUsers,
            limparSessoesDoDia: true,
          });

          // Resolve gateway: end_hotspot do plano (fallback ip de gerencia do
          // mikrotik do plano), senao busca do mikrotik da requisicao.
          // NUNCA usa a variavel `ip` (IP do cliente) como fallback aqui.
          gateway = plano.end_hotspot || plano.ip || null;
          const mtkIdPassivo = nasIdPassivo && nasIdPassivo > 0 ? nasIdPassivo : (mikrotik_id ? parseInt(mikrotik_id) : null);
          if (!gateway && mtkIdPassivo) {
            try {
              const [[reqMtk]] = await db.execute("SELECT end_hotspot, ip FROM mikrotiks WHERE id = ?", [mtkIdPassivo]);
              gateway = reqMtk?.end_hotspot || reqMtk?.ip || null;
            } catch (_) {}
          }
          const loginUrl = gateway ? `http://${gateway}/login?username=${username}&password=${senha}` : "";

          // Criar hotspot user no MikroTik com rate-limit do plano (fire-and-forget)
          if (mtkIdPassivo) {
            db.execute("SELECT ip, vpn_ip, usuario, senha, porta FROM mikrotiks WHERE id = ?", [mtkIdPassivo])
              .then(([[mtkRow]]) => {
                if (mtkRow) criarHotspotUser(mtkRow, { username, senha, rateLimit, duracaoMinutos: plano.duracao_minutos });
              })
              .catch(e => console.warn("[capturaPassiva] criarHotspotUser:", e.message));
          }

          notificarLiberacao({
            empresa_id: empresaId,
            portal_id: portalIdPassivo,
            mikrotik_id: nasIdPassivo,
            telefone: telefone || null,
            cpf: cpfLimpo || null,
            mac,
            contexto_tipo: "lead_passivo",
            vars: {
              nome: nome || null,
              username,
              password: senha,
              plano: "Lead",
              duracao: plano.duracao_minutos,
              velocidade: `${plano.velocidade_down}M/${plano.velocidade_up}M`,
              login_url: loginUrl,
              cpf: cpfLimpo || "",
            },
          }).catch(err => console.warn("[capturaPassiva] notificarLiberacao falhou:", err.message));
        }
      } catch (planoErr) {
        console.warn("[capturaPassiva] Plano Lead não encontrado, sem RADIUS:", planoErr.message);
      }
    }

    if (!gateway) {
      // Sem RADIUS: notificar apenas como lead passivo
      notificarLiberacao({
        empresa_id: empresaId,
        portal_id: portalIdPassivo,
        mikrotik_id: mikrotik_id || null,
        telefone: telefone || null,
        cpf: cpfLimpo || null,
        mac: mac || null,
        contexto_tipo: "lead_passivo",
        vars: { nome: nome || null, cpf: cpfLimpo || "" },
      }).catch(err => console.warn("[capturaPassiva] notificarLiberacao falhou:", err.message));
    }

    return res.json({
      success: true,
      message: "Lead cadastrado com sucesso!",
      redirect_url: redirectUrl,
      redirect_delay: redirectDelay,
      gateway: gateway || null,
      username: username || null,
      password: senha || null,
    });
  } catch (err) {
    console.error("Erro Captura Passiva Lead:", err);
    return res.status(500).json({ message: "Erro interno ao processar cadastro de Lead" });
  }
};


// Login público para portal Lead (cria RADIUS + retorna gateway)
exports.leadLogin = async (req, res) => {
  try {
    const { nome, email, telefone, cpf, mac, ip, mikrotik_id } = req.body;

    if (!mac || !ip) {
      return res.status(400).json({ message: "MAC e IP são obrigatórios" });
    }

    // Resolver empresa_id via mikrotik_id
    let empresaId = null;
    if (mikrotik_id) {
      const [[mtk]] = await db.execute("SELECT empresa_id FROM mikrotiks WHERE id = ?", [mikrotik_id]);
      empresaId = mtk?.empresa_id || null;
    }

    // Username: reusa conta existente do cliente (telefone/email/MAC/CPF via
    // radius_users ou leads), senão telefone limpo > email > MAC
    const contaLead = await radius.findExistingUser({ cpf, telefone, email, mac, empresaId });
    const username = contaLead?.username
      || radius.resolveUsername({ telefone, email, mac }, ["telefone", "email", "mac"]);
    const senha = username;

    // Busca plano Lead da empresa (LEFT JOIN: funciona mesmo com mikrotik_id=0 no seed)
    let planoQuery = `
      SELECT p.id, p.duracao_minutos, p.velocidade_down, p.velocidade_up, p.mikrotik_id, p.shared_users, m.end_hotspot, m.ip
      FROM planos p
      LEFT JOIN mikrotiks m ON p.mikrotik_id = m.id
      WHERE LOWER(p.nome) = 'lead'`;
    const planoParams = [];

    if (empresaId) {
      planoQuery += ` AND p.empresa_id = ?`;
      planoParams.push(empresaId);
    }

    planoQuery += ` LIMIT 1`;
    const [[plano]] = await db.query(planoQuery, planoParams);

    if (!plano) {
      return res.status(404).json({ message: "Plano Lead não configurado. Crie um plano com nome 'Lead'." });
    }

    // Salvar lead (permite reconexão: pula INSERT se já existe por CPF,
    // telefone ou email)
    const cpfLimpoLead = cpf ? cpf.replace(/\D/g, "") : null;
    let leadExistenteLogin = await verificarLeadExistentePorContato({ cpf: cpfLimpoLead, telefone, email, empresaId });

    let leadIdLogin = leadExistenteLogin?.id || null;
    if (!leadExistenteLogin) {
      try {
        const [insertLeadLogin] = await db.execute(
          `INSERT INTO leads (empresa_id, nome, email, telefone, cpf, mac, ip, origem, lgpd_aceite, lgpd_aceite_em)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'portal_lead', 1, NOW())`,
          [empresaId, nome || null, email || null, telefone || null, cpf || null, mac || null, ip || null]
        );
        leadIdLogin = insertLeadLogin.insertId;
      } catch (leadErr) {
        console.warn("Aviso: erro ao inserir lead:", leadErr.message);
      }
    }

    const rateLimit = `${plano.velocidade_up}M/${plano.velocidade_down}M`;
    const tempoSegundos = plano.duracao_minutos * 60;
    const sharedUsers = plano.shared_users || 1;

    // nas_id: usa mikrotik do plano; fallback no mikrotik da requisição (plano.mikrotik_id pode ser 0)
    const nasIdLead = plano.mikrotik_id || (mikrotik_id ? parseInt(mikrotik_id) : null);

    await radius.provisionUser({
      username,
      senha,
      empresaId,
      planoId: plano.id,
      grupoId: plano.id,
      nasId: nasIdLead,
      tempoSegundos,
      rateLimit,
      sharedUsers,
      limparSessoesDoDia: true,
    });

    // Resolve gateway pelo end_hotspot do plano (fallback ip de gerencia do
    // mikrotik do plano), senao busca do mikrotik da requisicao.
    // NUNCA usa a variavel `ip` (IP do cliente) como fallback aqui.
    let gateway = plano.end_hotspot || plano.ip || null;
    const mtkIdLead = nasIdLead && nasIdLead > 0 ? nasIdLead : (mikrotik_id ? parseInt(mikrotik_id) : null);
    if (!gateway && mtkIdLead) {
      try {
        const [[reqMtk]] = await db.execute("SELECT end_hotspot, ip FROM mikrotiks WHERE id = ?", [mtkIdLead]);
        gateway = reqMtk?.end_hotspot || reqMtk?.ip || null;
      } catch (_) {}
    }
    const loginUrl = gateway ? `http://${gateway}/login?username=${username}&password=${senha}` : "";

    // Criar hotspot user no MikroTik com rate-limit do plano (fire-and-forget)
    if (mtkIdLead) {
      db.execute("SELECT ip, vpn_ip, usuario, senha, porta FROM mikrotiks WHERE id = ?", [mtkIdLead])
        .then(([[mtkRow]]) => {
          if (mtkRow) criarHotspotUser(mtkRow, { username, senha, rateLimit, duracaoMinutos: plano.duracao_minutos });
        })
        .catch(e => console.warn("[leadLogin] criarHotspotUser:", e.message));
    }

    // Resolver portal_id Lead da empresa (notificacao WhatsApp + toggle "oferecer planos")
    let portalId = null;
    let oferecePlanosLead = false;
    if (empresaId) {
      try {
        const [[portalLead]] = await db.execute(
          "SELECT id, configuracoes FROM portais WHERE tipo = 'lead' AND empresa_id = ? LIMIT 1",
          [empresaId]
        );
        portalId = portalLead?.id || null;
        if (portalLead?.configuracoes) {
          try { oferecePlanosLead = !!JSON.parse(portalLead.configuracoes).oferecer_planos; } catch (_) {}
        }
      } catch (_) {}
    }

    notificarLiberacao({
      empresa_id: empresaId,
      portal_id: portalId,
      mikrotik_id: plano.mikrotik_id,
      telefone: telefone || null,
      cpf: cpf ? cpf.replace(/\D/g, "") : null,
      mac,
      contexto_tipo: "lead",
      vars: {
        nome: nome || null,
        username,
        password: senha,
        plano: "Lead",
        duracao: plano.duracao_minutos,
        velocidade: `${plano.velocidade_down}M/${plano.velocidade_up}M`,
        login_url: loginUrl,
        cpf: cpf ? cpf.replace(/\D/g, "") : "",
      },
    }).catch(err => console.warn("[leadLogin] notificarLiberacao falhou:", err.message));

    return res.json({
      success: true,
      gateway,
      username,
      password: senha,
      ja_cadastrado: !!leadExistenteLogin,
      nome_existente: leadExistenteLogin?.nome || null,
      cliente_id: leadIdLogin,
      oferece_planos: oferecePlanosLead,
    });
  } catch (err) {
    console.error("Erro Lead Login:", err);
    return res.status(500).json({ message: "Erro interno ao processar login Lead" });
  }
};

exports.listarLeads = async (req, res) => {
  try {
    const { status, q } = req.query;
    let query = "SELECT * FROM leads WHERE empresa_id = ?";
    const params = [req.empresa_id];

    if (status && status !== "todos") {
      query += " AND status = ?";
      params.push(status);
    }

    if (q) {
      query += " AND (nome LIKE ? OR email LIKE ? OR cpf LIKE ?)";
      const search = `%${q}%`;
      params.push(search, search, search);
    }

    query += " ORDER BY criado_em DESC";

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error("Erro ao listar leads:", err);
    res.status(500).json({ message: "Erro ao listar leads" });
  }
};

exports.criarLead = async (req, res) => {
  try {
    const { nome, email, telefone, cpf, mac, ip, status, origem, observacoes, lgpd_aceite } = req.body;

    const [result] = await db.execute(
      `INSERT INTO leads (empresa_id, nome, email, telefone, cpf, mac, ip, status, origem, observacoes, lgpd_aceite)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.empresa_id,
        nome || null,
        email || null,
        telefone || null,
        cpf || null,
        mac || null,
        ip || null,
        status || "novo",
        origem || "manual",
        observacoes || null,
        lgpd_aceite ? 1 : 0
      ]
    );

    res.status(201).json({ id: result.insertId, message: "Lead criado com sucesso" });
  } catch (err) {
    console.error("Erro ao criar lead:", err);
    res.status(500).json({ message: "Erro ao criar lead" });
  }
};

exports.atualizarLead = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, telefone, cpf, status, observacoes } = req.body;

    const fields = [];
    const params = [];

    if (nome !== undefined) { fields.push("nome = ?"); params.push(nome); }
    if (email !== undefined) { fields.push("email = ?"); params.push(email); }
    if (telefone !== undefined) { fields.push("telefone = ?"); params.push(telefone); }
    if (cpf !== undefined) { fields.push("cpf = ?"); params.push(cpf); }
    if (status !== undefined) { fields.push("status = ?"); params.push(status); }
    if (observacoes !== undefined) { fields.push("observacoes = ?"); params.push(observacoes); }

    if (fields.length === 0) {
      return res.status(400).json({ message: "Nenhum campo para atualizar" });
    }

    params.push(id, req.empresa_id);

    const [result] = await db.execute(
      `UPDATE leads SET ${fields.join(", ")} WHERE id = ? AND empresa_id = ?`,
      params
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Lead não encontrado" });
    }

    res.json({ message: "Lead atualizado com sucesso" });
  } catch (err) {
    console.error("Erro ao atualizar lead:", err);
    res.status(500).json({ message: "Erro ao atualizar lead" });
  }
};

exports.deletarLead = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.execute(
      "DELETE FROM leads WHERE id = ? AND empresa_id = ?",
      [id, req.empresa_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Lead não encontrado" });
    }

    res.json({ message: "Lead deletado com sucesso" });
  } catch (err) {
    console.error("Erro ao deletar lead:", err);
    res.status(500).json({ message: "Erro ao deletar lead" });
  }
};

exports.exportarLeadsCSV = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT nome, email, telefone, cpf, mac, ip, status, origem, observacoes, lgpd_aceite, criado_em FROM leads WHERE empresa_id = ? ORDER BY criado_em DESC",
      [req.empresa_id]
    );

    const header = "Nome,Email,Telefone,CPF,MAC,IP,Status,Origem,Observacoes,LGPD Aceite,Criado Em\n";
    const csvRows = rows.map(r => {
      return [
        `"${(r.nome || '').replace(/"/g, '""')}"`,
        `"${(r.email || '').replace(/"/g, '""')}"`,
        `"${(r.telefone || '').replace(/"/g, '""')}"`,
        `"${(r.cpf || '').replace(/"/g, '""')}"`,
        `"${(r.mac || '').replace(/"/g, '""')}"`,
        `"${(r.ip || '').replace(/"/g, '""')}"`,
        `"${r.status}"`,
        `"${r.origem}"`,
        `"${(r.observacoes || '').replace(/"/g, '""')}"`,
        r.lgpd_aceite ? "Sim" : "Não",
        `"${r.criado_em ? new Date(r.criado_em).toLocaleString('pt-BR') : ''}"`
      ].join(",");
    }).join("\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=leads.csv");
    res.send("\uFEFF" + header + csvRows);
  } catch (err) {
    console.error("Erro ao exportar leads:", err);
    res.status(500).json({ message: "Erro ao exportar leads" });
  }
};

// Cadastro de cliente para portal Planos (pré-pagamento)
exports.cadastroCliente = async (req, res) => {
  try {
    const { nome, email, telefone, cpf, mac, ip, mikrotik_id } = req.body;

    if (!nome || !email || !telefone || !cpf) {
      return res.status(400).json({ message: "Nome, email, telefone e CPF são obrigatórios" });
    }

    let empresaId = null;
    if (mikrotik_id) {
      const [[mtk]] = await db.execute("SELECT empresa_id FROM mikrotiks WHERE id = ?", [mikrotik_id]);
      empresaId = mtk?.empresa_id || null;
    }

    // Verificar CPF duplicado
    const existing = await verificarLeadExistente(cpf, empresaId);
    if (existing) {
      const cpfLimpo = cpf.replace(/\D/g, "");

      // Atualiza os dados do lead existente com os novos valores do formulario.
      // Sem isso, o sistema sempre usaria o telefone/nome/email do PRIMEIRO cadastro
      // do CPF, mesmo o usuario tendo informado dados novos agora.
      // Preserva isolamento multi-tenant filtrando por empresa_id.
      try {
        await db.execute(
          `UPDATE leads SET
             nome = COALESCE(?, nome),
             email = COALESCE(?, email),
             telefone = COALESCE(?, telefone),
             mac = COALESCE(?, mac),
             ip = COALESCE(?, ip)
           WHERE id = ?${empresaId ? " AND empresa_id = ?" : ""}`,
          empresaId
            ? [nome || null, email || null, telefone || null, mac || null, ip || null, existing.id, empresaId]
            : [nome || null, email || null, telefone || null, mac || null, ip || null, existing.id]
        );
      } catch (updErr) {
        console.warn("Aviso: falha ao atualizar lead existente:", updErr.message);
      }

      // Verificar se tem plano ativo no RADIUS
      try {
        const radcheckRows = await radius.getUserAttributes(cpfLimpo);

        if (radcheckRows.length > 0) {
          const maxSessionRow = radcheckRows.find(r => r.attribute === "Max-Daily-Session");
          const passwordRow = radcheckRows.find(r => r.attribute === "Cleartext-Password");
          const maxSession = maxSessionRow ? parseInt(maxSessionRow.value) : 0;
          const password = passwordRow ? passwordRow.value : cpfLimpo;

          // Somar tempo usado hoje
          const tempoUsado = await radius.getDailyUsage(cpfLimpo);

          if (maxSession > 0 && tempoUsado < maxSession) {
            // Buscar gateway do MikroTik
            let gateway = null;
            if (empresaId) {
              const [[mk]] = await db.query(
                "SELECT end_hotspot, ip FROM mikrotiks WHERE empresa_id = ? LIMIT 1", [empresaId]
              );
              gateway = mk?.end_hotspot || mk?.ip || null;
            }

            return res.json({
              id: existing.id, nome: existing.nome, email: existing.email,
              existente: true, planoAtivo: true,
              gateway, username: cpfLimpo, password,
              tempoRestante: maxSession - tempoUsado
            });
          }
        }
      } catch (radErr) {
        console.error("Erro ao verificar RADIUS:", radErr.message);
      }

      // Sem plano ativo — segue para planos
      return res.json({ id: existing.id, nome: existing.nome, email: existing.email, existente: true, planoAtivo: false });
    }

    const cpfLimpo = cpf.replace(/\D/g, "");

    const [result] = await db.execute(
      `INSERT INTO leads (empresa_id, nome, email, telefone, cpf, mac, ip, origem, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'portal_planos', 'novo')`,
      [empresaId, nome, email, telefone, cpfLimpo, mac || null, ip || null]
    );

    res.json({ id: result.insertId, nome, email, existente: false });
  } catch (err) {
    console.error("Erro ao cadastrar cliente:", err);
    res.status(500).json({ message: "Erro interno ao processar cadastro" });
  }
};
