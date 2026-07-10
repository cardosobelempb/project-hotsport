require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const db = require('../db');

async function idxExists(conn, table, idx) {
  const [rows] = await conn.execute(
    "SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?",
    [table, idx]
  );
  return rows[0].cnt > 0;
}

async function migrate() {
  const conn = await db.getConnection();
  try {
    console.log('=== Migration 018: Dedupe + UNIQUE em radius_users.username ===\n');

    // 1. Dedupe: mantem a linha de MAIOR id por username (liberacao mais recente).
    //    Idempotente: na segunda execucao deleta 0 linhas.
    console.log('1. Removendo duplicados de radius_users (mantem id mais recente)...');
    const [del] = await conn.execute(`
      DELETE ru FROM radius_users ru
      JOIN radius_users mais_novo
        ON mais_novo.username = ru.username AND mais_novo.id > ru.id
    `);
    console.log(`   -> ${del.affectedRows} linha(s) duplicada(s) removida(s)`);

    // 2. UNIQUE global em username. FreeRADIUS autentica por username global
    //    (radcheck nao tem empresa_id) — dois tenants com o mesmo username
    //    compartilhariam credenciais. A unicidade tem que ser global.
    console.log('2. Indice UNIQUE uq_radius_users_username...');
    if (!(await idxExists(conn, 'radius_users', 'uq_radius_users_username'))) {
      await conn.execute(`ALTER TABLE radius_users ADD UNIQUE KEY uq_radius_users_username (username)`);
      console.log('   -> indice criado');
    } else {
      console.log('   -> ja existe');
    }

    console.log('\n=== Migration 018 concluida com sucesso! ===');
  } catch (err) {
    console.error('Erro na migration:', err);
    throw err;
  } finally {
    conn.release();
    process.exit(0);
  }
}

migrate();
