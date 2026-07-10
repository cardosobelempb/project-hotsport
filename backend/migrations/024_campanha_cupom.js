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
    console.log('=== Migration 024: Item Cupom em campanhas ===\n');

    console.log('1. ENUM tipo com cupom...');
    await conn.execute(
      "ALTER TABLE campanha_itens MODIFY COLUMN tipo ENUM('imagem','video','adsense','youtube','afiliado','cupom') NOT NULL"
    );
    console.log('   -> ok');

    const colunas = [
      ['cupom_codigo',         "VARCHAR(50) NULL AFTER afiliado_destaques"],
      ['cupom_desconto_tipo',  "ENUM('percentual','valor_fixo') NULL AFTER cupom_codigo"],
      ['cupom_desconto_valor', "DECIMAL(10,2) NULL AFTER cupom_desconto_tipo"],
      ['cupom_validade',       "DATE NULL AFTER cupom_desconto_valor"],
      ['cupom_descricao',      "TEXT NULL AFTER cupom_validade"],
      ['cupom_link',           "VARCHAR(500) NULL AFTER cupom_descricao"],
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

    console.log('\n=== Migration 024 concluida com sucesso! ===');
  } catch (err) {
    console.error('Erro na migration:', err);
    throw err;
  } finally {
    conn.release();
    process.exit(0);
  }
}

migrate();
