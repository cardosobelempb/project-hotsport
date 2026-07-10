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
    console.log('=== Migration 023: Agendamento/Segmentacao de campanhas + tracking de eventos ===\n');

    console.log('1. Colunas de agendamento/segmentacao em campanhas...');
    const colunas = [
      ['data_inicio',           "DATE NULL AFTER ativo"],
      ['data_fim',               "DATE NULL AFTER data_inicio"],
      ['horario_inicio',         "TIME NULL AFTER data_fim"],
      ['horario_fim',            "TIME NULL AFTER horario_inicio"],
      ['dias_semana',            "JSON NULL AFTER horario_fim"],
      ['dispositivos',           "JSON NULL AFTER dias_semana"],
      ['sistemas_operacionais',  "JSON NULL AFTER dispositivos"],
      ['mikrotiks_permitidos',   "JSON NULL AFTER sistemas_operacionais"],
    ];

    let n = 2;
    for (const [col, def] of colunas) {
      console.log(`${n}. Coluna campanhas.${col}...`);
      if (!(await colExists(conn, 'campanhas', col))) {
        await conn.execute(`ALTER TABLE campanhas ADD COLUMN ${col} ${def}`);
        console.log('   -> coluna adicionada');
      } else {
        console.log('   -> ja existe');
      }
      n++;
    }

    console.log(`\n${n}. Criando tabela campanha_eventos...`);
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS campanha_eventos (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        empresa_id INT NOT NULL,
        campanha_id INT NOT NULL,
        item_id INT NULL,
        portal_id INT NULL,
        mikrotik_id INT NULL,
        tipo_evento ENUM('impressao','clique') NOT NULL,
        dispositivo VARCHAR(20) NULL,
        sistema_operacional VARCHAR(20) NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_evt_campanha FOREIGN KEY (campanha_id) REFERENCES campanhas(id) ON DELETE CASCADE,
        CONSTRAINT fk_evt_item     FOREIGN KEY (item_id)     REFERENCES campanha_itens(id) ON DELETE SET NULL,
        CONSTRAINT fk_evt_portal   FOREIGN KEY (portal_id)   REFERENCES portais(id) ON DELETE SET NULL,
        CONSTRAINT fk_evt_mikrotik FOREIGN KEY (mikrotik_id) REFERENCES mikrotiks(id) ON DELETE SET NULL,
        INDEX idx_evt_campanha_data (campanha_id, criado_em),
        INDEX idx_evt_campanha_tipo_data (campanha_id, tipo_evento, criado_em),
        INDEX idx_evt_item (item_id),
        INDEX idx_evt_empresa_data (empresa_id, criado_em)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('   -> tabela campanha_eventos criada (ou ja existia)');

    console.log('\n=== Migration 023 concluida com sucesso! ===');
  } catch (err) {
    console.error('Erro na migration:', err);
    throw err;
  } finally {
    conn.release();
    process.exit(0);
  }
}

migrate();
