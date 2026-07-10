require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const db = require('../db');

async function colExists(conn, table, col) {
  const [rows] = await conn.execute(
    "SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?",
    [table, col]
  );
  return rows[0].cnt > 0;
}

async function tableExists(conn, table) {
  const [rows] = await conn.execute(
    "SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?",
    [table]
  );
  return rows[0].cnt > 0;
}

async function migrate() {
  const conn = await db.getConnection();
  try {
    console.log('=== Migration 030: Rotacao de campanhas concorrentes por portal (task 012) ===\n');

    // 1. Tabela de associacao N:N portal <-> campanha (substitui portais.campanha_ativa_id 1:1)
    console.log('1. Tabela portal_campanhas...');
    if (!(await tableExists(conn, 'portal_campanhas'))) {
      await conn.execute(`
        CREATE TABLE portal_campanhas (
          id INT AUTO_INCREMENT PRIMARY KEY,
          portal_id INT NOT NULL,
          campanha_id INT NOT NULL,
          criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY uniq_portal_campanha (portal_id, campanha_id),
          CONSTRAINT fk_portal_campanhas_portal
            FOREIGN KEY (portal_id) REFERENCES portais(id) ON DELETE CASCADE,
          CONSTRAINT fk_portal_campanhas_campanha
            FOREIGN KEY (campanha_id) REFERENCES campanhas(id) ON DELETE CASCADE,
          INDEX idx_portal_campanhas_campanha (campanha_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
      console.log('   -> tabela criada');
    } else {
      console.log('   -> ja existe');
    }

    // 2. Ponteiro de rotacao (round-robin) por portal: guarda o id da ultima
    // campanha servida, pra avancar pra proxima elegivel na proxima chamada.
    console.log('\n2. Coluna portais.campanha_rotacao_ultima_id...');
    if (!(await colExists(conn, 'portais', 'campanha_rotacao_ultima_id'))) {
      await conn.execute(
        "ALTER TABLE portais ADD COLUMN campanha_rotacao_ultima_id INT NULL DEFAULT NULL"
      );
      console.log('   -> coluna adicionada');
    } else {
      console.log('   -> ja existe');
    }

    // 3. Backfill: portais que ja tinham uma campanha unica vinculada (1:1)
    // viram o primeiro registro da nova lista N:N. Nao mexe em
    // portais.campanha_ativa_id (fica orfa/nao usada pelo codigo novo, mas
    // preservada como rede de seguranca em vez de DROP COLUMN irreversivel).
    console.log('\n3. Backfill portal_campanhas a partir de portais.campanha_ativa_id...');
    const [result] = await conn.execute(`
      INSERT IGNORE INTO portal_campanhas (portal_id, campanha_id)
      SELECT id, campanha_ativa_id FROM portais WHERE campanha_ativa_id IS NOT NULL
    `);
    console.log(`   -> ${result.affectedRows} vinculo(s) migrado(s)`);

    console.log('\n=== Migration 030 concluida com sucesso! ===');
  } catch (err) {
    console.error('Erro na migration:', err);
    throw err;
  } finally {
    conn.release();
    process.exit(0);
  }
}

migrate();
