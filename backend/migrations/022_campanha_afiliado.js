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
    console.log('=== Migration 022: Item Link de Afiliado em campanhas ===\n');

    console.log('1. ENUM tipo com afiliado...');
    await conn.execute(
      "ALTER TABLE campanha_itens MODIFY COLUMN tipo ENUM('imagem','video','adsense','youtube','afiliado') NOT NULL"
    );
    console.log('   -> ok');

    const colunas = [
      ['afiliado_link',           "VARCHAR(500) NULL AFTER ad_height"],
      ['afiliado_imagem_url',     "VARCHAR(500) NULL AFTER afiliado_link"],
      ['afiliado_descricao',      "TEXT NULL AFTER afiliado_imagem_url"],
      ['afiliado_preco',          "DECIMAL(10,2) NULL AFTER afiliado_descricao"],
      ['afiliado_preco_original', "DECIMAL(10,2) NULL AFTER afiliado_preco"],
      ['afiliado_destaques',      "TEXT NULL AFTER afiliado_preco_original"], // JSON array de strings
    ];

    let n = 2;
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

    console.log('\n=== Migration 022 concluida com sucesso! ===');
  } catch (err) {
    console.error('Erro na migration:', err);
    throw err;
  } finally {
    conn.release();
    process.exit(0);
  }
}

migrate();
