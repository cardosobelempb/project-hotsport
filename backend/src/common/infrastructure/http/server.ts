import "dotenv/config";

import { buildApp } from "./app.js";

const PORT = Number(process.env["PORT"] ?? 4949);
const HOST = process.env["HOST"] ?? "0.0.0.0";

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
    app.log.info(`🚀 Server running at http://${HOST}:${PORT}`);
    app.log.info(`📄 Docs available at http://${HOST}:${PORT}/docs`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}
