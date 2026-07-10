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
    console.log('=== Migration 026: categoria de negocio em campanhas ===\n');

    console.log('1. Coluna campanhas.categoria...');
    if (!(await colExists(conn, 'campanhas', 'categoria'))) {
      await conn.execute(
        "ALTER TABLE campanhas ADD COLUMN categoria ENUM('promocao_local','campanha_institucional','oferta_patrocinada') NULL AFTER descricao"
      );
      console.log('   -> coluna adicionada');
    } else {
      console.log('   -> ja existe');
    }

    console.log('\n=== Migration 026 concluida com sucesso! ===');
  } catch (err) {
    console.error('Erro na migration:', err);
    throw err;
  } finally {
    conn.release();
    process.exit(0);
  }
}

migrate();
