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
    console.log('=== Migration 028: Marketplace de afiliados (modelo de dados) ===\n');

    // 1. empresa_configs.config_type ganha um valor por programa de afiliado.
    // Reaproveita a tabela/padrao existente (config JSON por empresa+tipo,
    // UNIQUE(empresa_id, config_type)) em vez de criar tabela nova de
    // credenciais - o mesmo endpoint generico GET/POST /api/empresa-config/:tipo
    // ja serve qualquer um desses tipos.
    console.log('1. ENUM config_type com programas de afiliado...');
    await conn.execute(
      `ALTER TABLE empresa_configs MODIFY COLUMN config_type ENUM(
        'mercadopago','efi','whatsapp',
        'afiliado_mercadolivre','afiliado_amazon','afiliado_shopee',
        'afiliado_hotmart','afiliado_eduzz','afiliado_monetizze',
        'afiliado_braip','afiliado_awin','afiliado_cj'
      ) NOT NULL`
    );
    console.log('   -> ok');

    // 2. Catalogo de produtos importados via API dos programas de afiliado.
    // Tabela separada de campanha_itens: produtos importados sao um catalogo
    // que o admin navega/pesquisa e escolhe incluir numa campanha - a escolha
    // de incluir gera um campanha_itens tipo 'afiliado' normal (copia os
    // campos, nao faz join ao vivo), preservando o contrato ja existente do
    // CampanhaPlayer/CampanhaPopupCard. `produto_importado_id` em
    // campanha_itens (abaixo) e so rastreabilidade pra permitir re-sync futuro.
    console.log('\n2. Tabela afiliado_produtos_importados...');
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS afiliado_produtos_importados (
        id INT AUTO_INCREMENT PRIMARY KEY,
        empresa_id INT NOT NULL,
        programa VARCHAR(30) NOT NULL,
        produto_externo_id VARCHAR(150) NOT NULL,
        titulo VARCHAR(200) NULL,
        imagem_url VARCHAR(500) NULL,
        descricao TEXT NULL,
        preco DECIMAL(10,2) NULL,
        preco_original DECIMAL(10,2) NULL,
        link VARCHAR(500) NOT NULL,
        categoria VARCHAR(100) NULL,
        sincronizado_em TIMESTAMP NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_afiliado_produtos_empresa
          FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
        UNIQUE KEY idx_produto_externo (empresa_id, programa, produto_externo_id),
        INDEX idx_afiliado_produtos_categoria (empresa_id, categoria)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('   -> tabela criada (ou ja existia).');

    // 3. Rastreabilidade: de qual produto importado este item de campanha veio
    // (NULL = item de afiliado criado manualmente, comportamento de hoje).
    console.log('\n3. Coluna campanha_itens.produto_importado_id...');
    if (!(await colExists(conn, 'campanha_itens', 'produto_importado_id'))) {
      await conn.execute(
        "ALTER TABLE campanha_itens ADD COLUMN produto_importado_id INT NULL AFTER afiliado_destaques"
      );
      await conn.execute(`
        ALTER TABLE campanha_itens
          ADD CONSTRAINT fk_campanha_itens_produto_importado
            FOREIGN KEY (produto_importado_id) REFERENCES afiliado_produtos_importados(id) ON DELETE SET NULL
      `);
      console.log('   -> coluna + FK adicionadas');
    } else {
      console.log('   -> ja existe');
    }

    console.log('\n=== Migration 028 concluida com sucesso! ===');
  } catch (err) {
    console.error('Erro na migration:', err);
    throw err;
  } finally {
    conn.release();
    process.exit(0);
  }
}

migrate();
