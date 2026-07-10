require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const db = require('../db');

async function migrate() {
  const conn = await db.getConnection();

  try {
    console.log('=== Migration 020: Banners nas paginas publicas ===\n');

    console.log('1. Criando tabela banners...');
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS banners (
        id INT AUTO_INCREMENT PRIMARY KEY,
        empresa_id INT NOT NULL,
        nome VARCHAR(150) NOT NULL,
        tipo ENUM('imagem','adsense') NOT NULL,
        posicao ENUM('topo','rodape') NOT NULL DEFAULT 'rodape',
        paginas TEXT NOT NULL,
        imagem_url VARCHAR(500) NULL,
        link_destino VARCHAR(500) NULL,
        ad_client VARCHAR(30) NULL,
        ad_slot VARCHAR(20) NULL,
        ad_format VARCHAR(30) NULL,
        ad_full_width TINYINT(1) DEFAULT 1,
        ad_width SMALLINT NULL,
        ad_height SMALLINT NULL,
        ativo TINYINT(1) DEFAULT 1,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_banners_empresa
          FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
        INDEX idx_banners_empresa (empresa_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('   -> Tabela banners criada (ou ja existia).');

    console.log('\n=== Migration 020 concluida com sucesso! ===');
  } catch (err) {
    console.error('Erro na migration:', err);
    throw err;
  } finally {
    conn.release();
    process.exit(0);
  }
}

migrate();
