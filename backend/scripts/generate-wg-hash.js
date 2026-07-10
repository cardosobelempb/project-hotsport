#!/usr/bin/env node
// Gera o PASSWORD_HASH para o wg-easy v14+
// Uso: node backend/scripts/generate-wg-hash.js 'SUA_SENHA'

const bcrypt = require('bcryptjs');

const password = process.argv[2];
if (!password) {
  console.error('Uso: node backend/scripts/generate-wg-hash.js \'SUA_SENHA\'');
  process.exit(1);
}

bcrypt.hash(password, 12).then(hash => {
  console.log('\nCopie o valor abaixo para WG_PASS_HASH no .env:\n');
  console.log(hash);
  console.log('');
});
