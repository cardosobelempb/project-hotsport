const db = require('../db');

async function up() {
  const [rows] = await db.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'mikrotiks' AND COLUMN_NAME = 'vpn_ip'`
  );

  if (rows.length === 0) {
    await db.query('ALTER TABLE mikrotiks ADD COLUMN vpn_ip VARCHAR(45) DEFAULT NULL AFTER portal_id');
    console.log('✅ Coluna vpn_ip adicionada à tabela mikrotiks');
  } else {
    console.log('ℹ️ Coluna vpn_ip já existe em mikrotiks, nada a fazer');
  }
}

up()
  .then(() => { console.log('Migration 016 concluída'); process.exit(0); })
  .catch(err => { console.error('❌ Migration 016 falhou:', err); process.exit(1); });
