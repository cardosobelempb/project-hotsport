const db = require("../../db");

exports.listarTemplates = async (req, res) => {
  try {
    const [templates] = await db.query(
      "SELECT id, nome, descricao, thumbnail_url, tipo, criado_em FROM portal_templates ORDER BY tipo, nome"
    );
    res.json(templates);
  } catch (err) {
    console.error("Erro ao listar templates:", err);
    res.status(500).json({ message: "Erro ao listar templates" });
  }
};

exports.obterTemplate = async (req, res) => {
  const { id } = req.params;
  try {
    const [[template]] = await db.query("SELECT * FROM portal_templates WHERE id = ?", [id]);
    if (!template) return res.status(404).json({ message: "Template não encontrado" });
    res.json(template);
  } catch (err) {
    console.error("Erro ao obter template:", err);
    res.status(500).json({ message: "Erro ao obter template" });
  }
};

exports.criarTemplate = async (req, res) => {
  const { nome, tipo, descricao, html_template, css_template } = req.body;
  if (!nome) return res.status(400).json({ message: "Nome é obrigatório" });
  try {
    await db.execute(
      `INSERT INTO portal_templates (nome, tipo, descricao, html_template, css_template)
       VALUES (?, ?, ?, ?, ?)`,
      [nome, tipo || "basico", descricao || null, html_template || "", css_template || null]
    );
    res.status(201).json({ message: "Template criado com sucesso" });
  } catch (err) {
    console.error("Erro ao criar template:", err);
    res.status(500).json({ message: "Erro ao criar template" });
  }
};

exports.atualizarTemplate = async (req, res) => {
  const { id } = req.params;
  const { nome, tipo, descricao, html_template, css_template } = req.body;
  try {
    const [[tmpl]] = await db.query("SELECT id FROM portal_templates WHERE id = ?", [id]);
    if (!tmpl) return res.status(404).json({ message: "Template não encontrado" });
    await db.execute(
      `UPDATE portal_templates SET nome = ?, tipo = ?, descricao = ?, html_template = ?, css_template = ?
       WHERE id = ?`,
      [nome, tipo || "basico", descricao || null, html_template || "", css_template || null, id]
    );
    res.json({ message: "Template atualizado" });
  } catch (err) {
    console.error("Erro ao atualizar template:", err);
    res.status(500).json({ message: "Erro ao atualizar template" });
  }
};

exports.deletarTemplate = async (req, res) => {
  const { id } = req.params;
  try {
    const [[tmpl]] = await db.query("SELECT id FROM portal_templates WHERE id = ?", [id]);
    if (!tmpl) return res.status(404).json({ message: "Template não encontrado" });
    await db.execute("DELETE FROM portal_templates WHERE id = ?", [id]);
    res.json({ message: "Template removido" });
  } catch (err) {
    console.error("Erro ao deletar template:", err);
    res.status(500).json({ message: "Erro ao deletar template" });
  }
};
