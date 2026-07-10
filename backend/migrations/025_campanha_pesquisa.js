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
    console.log('=== Migration 025: Item Pesquisa em campanhas ===\n');

    console.log('1. ENUM tipo com pesquisa...');
    await conn.execute(
      "ALTER TABLE campanha_itens MODIFY COLUMN tipo ENUM('imagem','video','adsense','youtube','afiliado','cupom','pesquisa') NOT NULL"
    );
    console.log('   -> ok');

    const colunas = [
      ['pesquisa_pergunta', "VARCHAR(300) NULL AFTER cupom_link"],
      ['pesquisa_formato',  "ENUM('multipla_escolha','escala') NULL AFTER pesquisa_pergunta"],
      ['pesquisa_opcoes',   "JSON NULL AFTER pesquisa_formato"],
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

    console.log(`\n${n}. Criando tabela campanha_pesquisa_respostas...`);
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS campanha_pesquisa_respostas (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        empresa_id INT NOT NULL,
        campanha_id INT NOT NULL,
        item_id INT NOT NULL,
        mac VARCHAR(20) NULL,
        resposta_opcao_index INT NULL,
        resposta_nota TINYINT NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_pesq_campanha FOREIGN KEY (campanha_id) REFERENCES campanhas(id) ON DELETE CASCADE,
        CONSTRAINT fk_pesq_item     FOREIGN KEY (item_id)     REFERENCES campanha_itens(id) ON DELETE CASCADE,
        UNIQUE KEY uq_pesquisa_item_mac (item_id, mac),
        INDEX idx_pesq_item (item_id),
        INDEX idx_pesq_empresa (empresa_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('   -> tabela campanha_pesquisa_respostas criada (ou ja existia)');

    console.log('\n=== Migration 025 concluida com sucesso! ===');
  } catch (err) {
    console.error('Erro na migration:', err);
    throw err;
  } finally {
    conn.release();
    process.exit(0);
  }
}

migrate();
