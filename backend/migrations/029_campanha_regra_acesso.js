require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const db = require('../db');

async function colExists(conn, table, col) {
  const [rows] = await conn.execute(
    "SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?",
    [table, col]
  );
  return rows[0].cnt > 0;
}

async function indexExists(conn, table, indexName) {
  const [rows] = await conn.execute(
    "SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?",
    [table, indexName]
  );
  return rows[0].cnt > 0;
}

async function migrate() {
  const conn = await db.getConnection();
  try {
    console.log('=== Migration 029: Segmentacao por primeiro acesso / recorrente ===\n');

    console.log('1. Coluna campanhas.regra_acesso...');
    if (!(await colExists(conn, 'campanhas', 'regra_acesso'))) {
      await conn.execute(
        "ALTER TABLE campanhas ADD COLUMN regra_acesso ENUM('qualquer','primeiro_acesso','recorrente') NOT NULL DEFAULT 'qualquer' AFTER mikrotiks_permitidos"
      );
      console.log('   -> coluna adicionada');
    } else {
      console.log('   -> ja existe');
    }

    // Indice pra checar "MAC ja apareceu antes" (leads) sem full table scan -
    // essa checagem roda no endpoint publico GET /api/public/campanha/:portalId,
    // que e' chamado a cada visita ao portal.
    console.log('\n2. Indice leads (empresa_id, mac)...');
    if (!(await indexExists(conn, 'leads', 'idx_leads_empresa_mac'))) {
      await conn.execute(
        "ALTER TABLE leads ADD INDEX idx_leads_empresa_mac (empresa_id, mac)"
      );
      console.log('   -> indice criado');
    } else {
      console.log('   -> ja existe');
    }

    console.log('\n=== Migration 029 concluida com sucesso! ===');
  } catch (err) {
    console.error('Erro na migration:', err);
    throw err;
  } finally {
    conn.release();
    process.exit(0);
  }
}

migrate();
