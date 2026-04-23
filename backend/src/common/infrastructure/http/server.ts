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

function printStartupBanner({
  publicHost,
  port,
}: {
  publicHost: string;
  port: number;
}) {
  const logger = buildLogger();
  const baseUrl = `http://${publicHost}:${port}`;
  logger.info({}, "");
  logger.info({}, "Hotspot API");
  logger.info({}, `- API:  ${baseUrl}`);
  logger.info({}, `- Docs: ${baseUrl}/docs`);
  // console.log(`- JSON: ${baseUrl}/swagger.json`);
  logger.info({}, "");
  // URLs “puras” tendem a ser clicáveis em mais terminais
  // console.log(`${baseUrl}/docs`);
  // console.log(`${baseUrl}/swagger.json`);
  // console.log("");
}

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
    printStartupBanner({ publicHost: PUBLIC_HOST, port: PORT });

    app.log.info({ host: HOST, port: PORT }, "Server started");

    // Em produção, se HOST for 0.0.0.0, isso não é um link útil.
    // Você pode condicionar para logar links só em dev:
    if (!isProd) {
      app.log.info(`Server running at http://${PUBLIC_HOST}:${PORT}`);
      app.log.info(`Docs available at http://${PUBLIC_HOST}:${PORT}/docs`);
    }
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}
