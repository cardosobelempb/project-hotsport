require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const mysql = require("mysql2/promise");

const MIGRATIONS_DIR = path.join(__dirname, "..", "migrations");
const MAX_TENTATIVAS = 30;
const INTERVALO_MS = 2000;

// Espera o MySQL aceitar conexoes antes de rodar as migrations - necessario
// porque no Swarm/Portainer (stack.yml) nao ha "depends_on: condition:
// service_healthy" como no docker-compose de dev, entao o backend pode subir
// antes do MySQL estar pronto.
async function aguardarMysql() {
  for (let tentativa = 1; tentativa <= MAX_TENTATIVAS; tentativa++) {
    try {
      const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306,
      });
      await conn.end();
      console.log(`[migrate] MySQL disponível (tentativa ${tentativa}/${MAX_TENTATIVAS})`);
      return true;
    } catch (err) {
      console.log(`[migrate] MySQL ainda indisponível (tentativa ${tentativa}/${MAX_TENTATIVAS}): ${err.code || err.message}`);
      await new Promise((r) => setTimeout(r, INTERVALO_MS));
    }
  }
  return false;
}

async function main() {
  const ok = await aguardarMysql();
  if (!ok) {
    console.error("[migrate] MySQL não respondeu a tempo - pulando migrations, backend sobe mesmo assim.");
    return;
  }

  const arquivos = fs.readdirSync(MIGRATIONS_DIR)
    .filter((f) => /^\d{3}_.*\.js$/.test(f))
    .sort();

  console.log(`[migrate] Rodando ${arquivos.length} migrations...`);
  for (const arquivo of arquivos) {
    const caminho = path.join(MIGRATIONS_DIR, arquivo);
    console.log(`\n[migrate] >>> ${arquivo}`);
    try {
      execFileSync(process.execPath, [caminho], { stdio: "inherit" });
    } catch (err) {
      // As migrations existentes sempre chamam process.exit(0) no finally
      // (mesmo depois de um erro capturado), entao isso raramente dispara -
      // mas se disparar (ex: erro de sintaxe no arquivo), nao trava o boot
      // do backend por causa disso. Mesma tolerancia do install.sh (colunas/
      // indices ja existentes sao ruido benigno esperado em reruns).
      console.error(`[migrate] aviso: ${arquivo} sinalizou erro, seguindo pra próxima.`);
    }
  }
  console.log("\n[migrate] Migrations concluídas.");
}

main().catch((err) => {
  console.error("[migrate] Erro inesperado ao rodar migrations (backend sobe mesmo assim):", err);
});
