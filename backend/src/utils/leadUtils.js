const db = require("../../db");

/**
 * Verifica se já existe um lead com o CPF informado para a empresa.
 * @param {string} cpf - CPF (pode ter máscara)
 * @param {number|null} empresaId
 * @returns {Object|null} lead existente ou null
 */
async function verificarLeadExistente(cpf, empresaId) {
  if (!cpf) return null;
  const cpfLimpo = cpf.replace(/\D/g, "");
  if (cpfLimpo.length < 11) return null;

  let query = "SELECT id, nome, email, telefone, cpf, origem, criado_em FROM leads WHERE REPLACE(REPLACE(cpf, '.', ''), '-', '') = ?";
  const params = [cpfLimpo];

  if (empresaId) {
    query += " AND empresa_id = ?";
    params.push(empresaId);
  }

  query += " ORDER BY criado_em DESC LIMIT 1";
  const [[existing]] = await db.execute(query, params);
  return existing || null;
}

/**
 * Verifica lead existente por CPF > telefone > email (nessa ordem de
 * prioridade). Usada nos portais "grátis" (lead, lead_passivo) onde CPF é
 * opcional — checar só CPF faz toda reconexão sem CPF preenchido virar uma
 * linha nova duplicada, mesmo repetindo o mesmo telefone/email de antes.
 * @returns {Object|null} lead existente ou null
 */
async function verificarLeadExistentePorContato({ cpf, telefone, email, empresaId }) {
  const porCpf = cpf ? await verificarLeadExistente(cpf, empresaId) : null;
  if (porCpf) return porCpf;

  const telNums = telefone ? telefone.replace(/\D/g, "") : null;
  if (telNums && telNums.length >= 10) {
    let query = `SELECT id, nome, email, telefone, cpf, origem, criado_em FROM leads
       WHERE REPLACE(REPLACE(REPLACE(REPLACE(telefone,'(',''),')',''),' ',''),'-','') = ?`;
    const params = [telNums];
    if (empresaId) { query += " AND empresa_id = ?"; params.push(empresaId); }
    query += " ORDER BY criado_em DESC LIMIT 1";
    const [[porTelefone]] = await db.execute(query, params);
    if (porTelefone) return porTelefone;
  }

  if (email) {
    let query = "SELECT id, nome, email, telefone, cpf, origem, criado_em FROM leads WHERE email = ?";
    const params = [email];
    if (empresaId) { query += " AND empresa_id = ?"; params.push(empresaId); }
    query += " ORDER BY criado_em DESC LIMIT 1";
    const [[porEmail]] = await db.execute(query, params);
    if (porEmail) return porEmail;
  }

  return null;
}

module.exports = { verificarLeadExistente, verificarLeadExistentePorContato };
