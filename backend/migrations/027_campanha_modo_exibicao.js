require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const db = require('../db');

async function colExists(conn, table, col) {
  const [rows] = await conn.execute(
    "SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?",
    [table, col]
  );
  return rows[0].cnt > 0;
}

async function migrate() {
  const conn = await db.getConnection();
  try {
    console.log('=== Migration 027: modo_exibicao (sequencia/popup) em campanha_itens ===\n');

    console.log('1. Coluna campanha_itens.modo_exibicao...');
    if (!(await colExists(conn, 'campanha_itens', 'modo_exibicao'))) {
      await conn.execute(
        "ALTER TABLE campanha_itens ADD COLUMN modo_exibicao ENUM('sequencia','popup') NOT NULL DEFAULT 'sequencia' AFTER tipo"
      );
      console.log('   -> coluna adicionada');
    } else {
      console.log('   -> ja existe');
    }

    console.log('\n=== Migration 027 concluida com sucesso! ===');
  } catch (err) {
    console.error('Erro na migration:', err);
    throw err;
  } finally {
    conn.release();
    process.exit(0);
  }
}

migrate();
