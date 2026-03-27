/**
 * ⚠️ IMPORTANTE
 * Este import DEVE ser o primeiro do projeto inteiro.
 * TypeORM, decorators e metadata dependem disso.
 */
import "reflect-metadata";

import { startServer } from "./server";

/**
 * Entry point da aplicação.
 * Responsável por inicializar dependências críticas
 * e iniciar o servidor apenas quando tudo estiver pronto.
 */
async function bootstrap(): Promise<void> {
  try {
    console.log("Inicializando Data Source...");

    // Inicializa conexão com o banco

    console.log("Data Source inicializado com sucesso! 🚀");

    // Inicia servidor HTTP
    startServer();
  } catch (error) {
    console.error("[Bootstrap] Erro ao inicializar a aplicação:", error);

    // Fail fast: encerra o processo com erro
    process.exit(1);
  }
}

bootstrap();
