import "dotenv/config";

import { env } from "../env/index.js";
import { buildLogger } from "../observability/logger.js";
import { buildApp } from "./app.js";

const PORT = env.PORT;
const HOST = env.HOST;

const isProd = env.NODE_ENV === "production";

// Só usa PUBLIC_HOST em desenvolvimento (para links clicáveis).
// Em produção, por padrão, usa o próprio HOST (ou você pode omitir logs de URL).
const PUBLIC_HOST = !isProd ? (env.PUBLIC_HOST ?? "localhost") : HOST;

const logger = buildLogger();
const baseUrl = `http://${PUBLIC_HOST}:${PORT}`;

export async function startServer() {
  const app = await buildApp({
    logger: true,
    cors: { origin: ["http://localhost:3000"], credentials: true },
    swagger: {
      title: "Hotspot API",
      version: "1.0.0",
      description: "API do sistema de hotspot",
    },
  });

  try {
    await app.listen({ port: PORT, host: HOST });

    // Banner mais amigável (principalmente em dev)
    logger.info({ publicHost: PUBLIC_HOST, port: PORT });

    // app.log.info({ host: HOST, port: PORT }, "Server started");

    // Em produção, se HOST for 0.0.0.0, isso não é um link útil.
    // Você pode condicionar para logar links só em dev:
    if (!isProd) {
      logger.info(
        {
          event: "SERVER_START",
          context: "bootstrap",
          host: PUBLIC_HOST,
          port: PORT,
          url: baseUrl,
        },
        "Server started successfully",
      );

      logger.info(
        {
          event: "DOCS_AVAILABLE",
          context: "bootstrap",
          url: `${baseUrl}/docs`,
        },
        "API documentation available",
      );
    }
  } catch (err) {
    logger.error({
      event: "SERVER_START_ERROR",
      context: "bootstrap",
      error: err,
    });
    process.exit(1);
  }
}
