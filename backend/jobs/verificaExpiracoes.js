require('dotenv').config({ path: '../.env' });
const db = require("../db");
const { removerUsuarioPorMac } = require("../src/controllers/mikrotikAPIController");

async function verificarExpiracoes() {
  try {
    const [expirados] = await db.query(`
  SELECT mac, ip FROM pagamentos
  WHERE expira_em IS NOT NULL AND expira_em <= NOW() AND status = 'approved'
`);

console.log(`🔍 Expirados encontrados:`, expirados.length);

  for (const { mac, ip } of expirados) {
  console.log(`⏳ Expirado: ${mac} - ${ip}`);
  await removerUsuarioPorMac(mac);
  await db.query(`UPDATE pagamentos SET status = 'expirado' WHERE mac = ? AND ip = ?`, [mac, ip]);
  console.log(`✅ Status atualizado para expirado: ${mac}`);
}

  } catch (err) {
    console.error("Erro ao verificar expirações:", err);
  }
}

verificarExpiracoes().finally(() => process.exit(0));

module.exports = verificarExpiracoes;
