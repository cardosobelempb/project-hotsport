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
    await conn.beginTransaction();
    console.log('=== Migration 017: Perfil da Empresa (descricao) ===\n');

    console.log('1. Coluna empresas.descricao...');
    if (!(await colExists(conn, 'empresas', 'descricao'))) {
      await conn.execute(`ALTER TABLE empresas ADD COLUMN descricao TEXT NULL AFTER telefone`);
      console.log('   -> coluna adicionada');
    } else {
      console.log('   -> ja existe');
    }

    await conn.commit();
    console.log('\n=== Migration 017 concluida com sucesso! ===');
  } catch (err) {
    await conn.rollback();
    console.error('Erro na migration:', err);
    throw err;
  } finally {
    conn.release();
    process.exit(0);
  }
}

migrate();
