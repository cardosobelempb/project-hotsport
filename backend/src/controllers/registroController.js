const db = require("../../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { DEFAULT_WHATSAPP_TEMPLATE, DEFAULT_PORTAL_PLANOS_CONFIG } = require("../constants/whatsappDefaults");

function gerarSlug(nome) {
  return nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 80);
}

exports.registrarEmpresa = async (req, res) => {
  const conn = await db.getConnection();

  try {
    const { nome, email, cnpj, telefone, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ message: "Nome, email e senha são obrigatórios" });
    }

    // Verificar se email já existe
    const [[existingAdmin]] = await conn.execute(
      "SELECT id FROM admins WHERE email = ?",
      [email]
    );
    if (existingAdmin) {
      return res.status(400).json({ message: "Email já cadastrado" });
    }

    // Gerar slug único
    let slug = gerarSlug(nome);
    const [[existingSlug]] = await conn.execute(
      "SELECT id FROM empresas WHERE slug = ?",
      [slug]
    );
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    await conn.beginTransaction();

    // Criar empresa
    const [empresaResult] = await conn.execute(
      `INSERT INTO empresas (nome, slug, cnpj, email, telefone) VALUES (?, ?, ?, ?, ?)`,
      [nome, slug, cnpj || null, email, telefone || null]
    );
    const empresaId = empresaResult.insertId;

    // Criar admin owner
    const hashedPassword = await bcrypt.hash(senha, 10);
    const [adminResult] = await conn.execute(
      `INSERT INTO admins (empresa_id, email, nome, role, password) VALUES (?, ?, ?, 'owner', ?)`,
      [empresaId, email, nome, hashedPassword]
    );
    const adminId = adminResult.insertId;

    // Criar portais padrão para a nova empresa
    const planosConfigJson = JSON.stringify(DEFAULT_PORTAL_PLANOS_CONFIG);
    const trialConfigJson = JSON.stringify({ trial_duracao_minutos: 3, trial_velocidade_down: 2, trial_velocidade_up: 2 });
    const campanhaConfigJson = JSON.stringify({ campanha_duracao_segundos: 30, acesso_duracao_minutos: 60, acesso_velocidade_down: 5, acesso_velocidade_up: 2 });
    await conn.execute(
      `INSERT INTO portais (empresa_id, nome, slug, tipo, url_redirect, ativo, whatsapp_template, configuracoes) VALUES
       (?, 'LGPD - Coleta de Dados', 'lgpd', 'lgpd', '/cadastro', 1, ?, NULL),
       (?, 'Planos - Pagamento', 'planos', 'planos', '/planos-cliente', 1, ?, ?),
       (?, 'Cadastro de LEAD', 'lead', 'lead', '/lead', 1, ?, NULL),
       (?, 'Cadastro de LEAD (Sem Internet)', 'lead-passivo', 'lead_passivo', '/lead-passivo', 1, ?, NULL),
       (?, 'Acesso Wi-Fi', 'login', 'login', '/login-hotspot', 1, ?, NULL),
       (?, 'Trial por Tempo', 'trial-tempo', 'trial_tempo', '/trial-tempo', 1, ?, ?),
       (?, 'Campanha + Acesso', 'campanha-pre-acesso', 'campanha_pre_acesso', '/campanha-pre-acesso', 1, ?, ?),
       (?, 'Reconexão - Renovar Acesso', 'reconexao', 'reconexao', '/reconectar', 1, ?, NULL)`,
      [
        empresaId, DEFAULT_WHATSAPP_TEMPLATE,
        empresaId, DEFAULT_WHATSAPP_TEMPLATE, planosConfigJson,
        empresaId, DEFAULT_WHATSAPP_TEMPLATE,
        empresaId, DEFAULT_WHATSAPP_TEMPLATE,
        empresaId, DEFAULT_WHATSAPP_TEMPLATE,
        empresaId, DEFAULT_WHATSAPP_TEMPLATE, trialConfigJson,
        empresaId, DEFAULT_WHATSAPP_TEMPLATE, campanhaConfigJson,
        empresaId, DEFAULT_WHATSAPP_TEMPLATE,
      ]
    );

    await conn.commit();

    // Gerar token
    const token = jwt.sign(
      {
        id: adminId,
        email,
        empresa_id: empresaId,
        empresa_slug: slug,
        role: "owner",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      token,
      user: {
        id: adminId,
        email,
        nome,
        role: "owner",
        empresa_id: empresaId,
        empresa_slug: slug,
        empresa_nome: nome,
      },
      empresa: {
        id: empresaId,
        nome,
        slug,
        cnpj: cnpj || null,
        email,
        telefone: telefone || null,
      },
    });
  } catch (err) {
    await conn.rollback();
    console.error("Erro ao registrar empresa:", err);
    res.status(500).json({ message: "Erro ao registrar empresa" });
  } finally {
    conn.release();
  }
};
