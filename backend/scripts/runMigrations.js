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

// Aplica o schema base (backend/jobs/estrutura.sql) se o banco ainda estiver
// vazio. Serve de rede de seguranca pro deploy self-contained (docker-compose
// coolify.yml sobe um MySQL do zero) - o mecanismo nativo do MySQL
// (docker-entrypoint-initdb.d) so roda no PRIMEIRO boot com datadir
// completamente vazio, e e dificil de auditar/depurar remotamente quando
// falha silenciosamente (sem essa rede, um volume que nao ficou 100% vazio
// no primeiro boot deixa o banco sem as tabelas base, e todas as migrations
// que dependem delas - ex: 030_portal_campanhas.js precisando de "portais" -
// falham com ER_FK_CANNOT_OPEN_PARENT).
//
// Usa o binario "mysql" (cliente CLI, via execFileSync) em vez do driver
// mysql2 pra aplicar o dump inteiro - testado e confirmado que o mysql2 com
// multipleStatements derruba a conexao ("Connection lost") no meio de um
// arquivo deste tamanho (~80KB, centenas de statements), enquanto o cliente
// oficial roda o arquivo inteiro sem problema (e' o mesmo mecanismo usado
// pelo docker-entrypoint-initdb.d do proprio MySQL).
async function seedEstruturaSeNecessario() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
  });
  let precisaSeed;
  try {
    const [rows] = await conn.query(
      "SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'empresas'"
    );
    precisaSeed = rows[0].cnt === 0;
  } finally {
    await conn.end();
  }

  if (!precisaSeed) {
    console.log("[seed] Schema base ja existe (tabela 'empresas' encontrada) - pulando estrutura.sql.");
    return;
  }

  console.log("[seed] Banco vazio - aplicando backend/jobs/estrutura.sql via cliente mysql...");
  const caminhoSql = path.join(__dirname, "..", "jobs", "estrutura.sql");
  const sql = fs.readFileSync(caminhoSql);
  try {
    execFileSync(
      "mysql",
      [
        "-h", process.env.DB_HOST,
        "-P", String(process.env.DB_PORT || 3306),
        "-u", process.env.DB_USER,
        process.env.DB_NAME,
      ],
      {
        input: sql,
        env: { ...process.env, MYSQL_PWD: process.env.DB_PASSWORD },
        stdio: ["pipe", "inherit", "inherit"],
      }
    );
    console.log("[seed] estrutura.sql aplicada com sucesso.");
  } catch (err) {
    console.error("[seed] Erro ao aplicar estrutura.sql (seguindo mesmo assim, migrations abaixo tentam completar o schema):", err.message);
  }
}

async function main() {
  const ok = await aguardarMysql();
  if (!ok) {
    console.error("[migrate] MySQL não respondeu a tempo - pulando migrations, backend sobe mesmo assim.");
    return;
  }

  await seedEstruturaSeNecessario();

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
