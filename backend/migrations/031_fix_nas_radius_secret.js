/**
 * Migration 031 — Corrige o secret da tabela `nas`
 *
 * Problema: registros criados antes desta correção usavam mikrotik.senha
 * (senha admin do roteador) como RADIUS shared secret no campo `nas.secret`.
 * Porém clients.conf cobre 10.0.0.0/8 com secret='testing123', e FreeRADIUS
 * inicia com a tabela `nas` vazia (MikroTik cadastrado depois do start) —
 * sem reload SQL disponível no container Docker, FreeRADIUS usa clients.conf
 * com 'testing123'. O MikroTik enviava com mikrotik.senha → mismatch →
 * todos os pacotes RADIUS rejeitados → radacct vazia → sessões/logs zerados.
 *
 * Fix: padroniza nas.secret para o valor de RADIUS_SECRET (default 'testing123')
 * em todos os registros existentes, alinhando com clients.conf e com o wizard.
 */

const db = require('../db');

async function up() {
  const radiusSecret = process.env.RADIUS_SECRET || 'testing123';
  const [result] = await db.execute(
    "UPDATE nas SET secret = ? WHERE secret != ?",
    [radiusSecret, radiusSecret]
  );
  console.log(`✅ nas.secret atualizado: ${result.affectedRows} registro(s) corrigido(s) → '${radiusSecret}'`);
}

up()
  .then(() => { console.log('Migration 031 concluída.'); process.exit(0); })
  .catch(err => { console.error('Erro na migration 031:', err); process.exit(1); });
