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
    console.log('=== Migration 019: Itens AdSense e YouTube em campanhas ===\n');

    console.log('1. ENUM tipo com adsense e youtube...');
    await conn.execute(
      "ALTER TABLE campanha_itens MODIFY COLUMN tipo ENUM('imagem','video','adsense','youtube') NOT NULL"
    );
    console.log('   -> ok');

    console.log('2. arquivo_url opcional (item adsense nao tem arquivo)...');
    await conn.execute(
      "ALTER TABLE campanha_itens MODIFY COLUMN arquivo_url VARCHAR(500) NULL"
    );
    console.log('   -> ok');

    const colunas = [
      ['ad_client', "VARCHAR(30) NULL AFTER link_destino"],
      ['ad_slot', "VARCHAR(20) NULL AFTER ad_client"],
      ['ad_format', "VARCHAR(30) NULL AFTER ad_slot"],
      ['ad_full_width', "TINYINT(1) DEFAULT 1 AFTER ad_format"],
      ['ad_width', "SMALLINT NULL AFTER ad_full_width"],
      ['ad_height', "SMALLINT NULL AFTER ad_width"],
    ];

    let n = 3;
    for (const [col, def] of colunas) {
      console.log(`${n}. Coluna campanha_itens.${col}...`);
      if (!(await colExists(conn, 'campanha_itens', col))) {
        await conn.execute(`ALTER TABLE campanha_itens ADD COLUMN ${col} ${def}`);
        console.log('   -> coluna adicionada');
      } else {
        console.log('   -> ja existe');
      }
      n++;
    }

    console.log('\n=== Migration 019 concluida com sucesso! ===');
  } catch (err) {
    console.error('Erro na migration:', err);
    throw err;
  } finally {
    conn.release();
    process.exit(0);
  }
}

migrate();
