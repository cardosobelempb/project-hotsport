/**
 * ⚠️ IMPORTANTE
 * Este import DEVE ser o primeiro do projeto inteiro.
 * TypeORM, decorators e metadata dependem disso.
 */
import "reflect-metadata";
import "../env/index.js";

import { buildLogger } from "../observability/logger.js";
import { startServer } from "./server.js";

/**
 * Entry point da aplicação.
 * Responsável por inicializar dependências críticas
 * e iniciar o servidor apenas quando tudo estiver pronto.
 */
async function bootstrap(): Promise<void> {
  const logger = buildLogger();
  try {
    // Inicializa conexão com o banco
    logger.info(
      {
        event: "DB_INIT",
        context: "bootstrap",
      },
      "Data source initialized successfully",
    );

    // Inicia servidor HTTP
    await startServer();
  } catch (error) {
    logger.error(
      {
        event: "APP_INIT_ERROR",
        context: "bootstrap",
        err: error,
      },
      "Error while initializing application",
    );

    // Fail fast: encerra o processo com erro
    process.exit(1);
  }
}

bootstrap();
