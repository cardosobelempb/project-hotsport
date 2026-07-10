require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const db = require('../db');

async function migrate() {
  const conn = await db.getConnection();
  try {
    console.log('=== Migration 016: Trial Tempo + Campanha Pré-Acesso ===\n');

    console.log('Criando tabela pre_acesso_tokens...');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS pre_acesso_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        token VARCHAR(64) NOT NULL,
        empresa_id INT NOT NULL,
        portal_id INT,
        mikrotik_id INT,
        mac VARCHAR(20),
        ip VARCHAR(45),
        lead_id INT,
        cpf VARCHAR(20),
        nome VARCHAR(255),
        telefone VARCHAR(30),
        usado TINYINT(1) NOT NULL DEFAULT 0,
        expira_em TIMESTAMP NOT NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_token (token),
        INDEX idx_empresa (empresa_id),
        INDEX idx_expira (expira_em)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    console.log('\nMigration 016 concluida com sucesso!');
  } catch (err) {
    console.error('Erro na migration 016:', err);
    throw err;
  } finally {
    conn.release();
    process.exit(0);
  }
}

migrate();
