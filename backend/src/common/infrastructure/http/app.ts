import fastifyCors from "@fastify/cors";
import Fastify, { type FastifyInstance } from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";

import fastifyCookie from "@fastify/cookie";

import { env } from "../env/index.js";
import { buildLogger } from "../observability/logger.js";

import { authPlugin } from "@/common/shared/auth/auth.plugin.js";
import { swaggerPlugin } from "@/common/shared/http/swagger.plugin.js";
import { getPrismaClient } from "../db/prisma.client.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { registerRoutes } from "./routes.js";

export type BuildAppOptions = {
  logger?: boolean;
  cors?: {
    origin: string[];
    credentials: boolean;
  };
  swagger?: {
    title: string;
    version: string;
    description?: string;
  };
};

export async function buildApp(
  options: BuildAppOptions = {},
): Promise<FastifyInstance> {
  const isProd = process.env.NODE_ENV === "production";
  const logger = buildLogger();

  const app = Fastify({
    // Evita log de erros de validação, que já são tratados pelo errorHandler
    disableRequestLogging: true,
    //
    schemaErrorFormatter(errors, dataVar) {
      const validationError = new Error(
        "Existem campos inválidos na requisição.",
      );

      Object.assign(validationError, {
        statusCode: 400,
        code: "VALIDATION_ERROR",
        error: "Validation Error",
        validation: errors,
      });

      return validationError;
    },
    // Configura o logger do Fastify de acordo com o ambiente e as opções fornecidas
    logger:
      options.logger === false
        ? false
        : isProd
          ? { level: env.LOG_LEVEL ?? "info" }
          : {
              level: env.LOG_LEVEL ?? "debug",
              transport: {
                target: "pino-pretty",
                options: {
                  colorize: true,
                  translateTime: "SYS:standard",
                  ignore: "pid,hostname",
                  singleLine: false,
                },
              },
            },
  });

  // Prisma com logger integrado
  const prisma = getPrismaClient({ logger });

  // Zod compilers
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // Handler global de erros
  app.setErrorHandler(errorHandler);

  // CORS
  await app.register(fastifyCors, {
    origin: options.cors?.origin ?? env.ORIGIN,
    credentials: options.cors?.credentials ?? true,
  });

  const cookieSecret = env.COOKIE_SECRET;

  if (!cookieSecret) {
    logger.error({}, "Missing required environment variable: COOKIE_SECRET");
    throw new Error("Missing required environment variable: COOKIE_SECRET");
  }

  // Cookie
  await app.register(fastifyCookie, {
    secret: cookieSecret,
  });

  await app.register(swaggerPlugin, options);
  await app.register(authPlugin);

  // Disponibiliza logger e prisma via decorator para toda a aplicação
  app.decorate("logger", logger);
  app.decorate("prisma", prisma);

  // Loga inicialização dos plugins
  app.addHook("onReady", async () => {
    logger.info(
      {
        port: env.PORT,
        env: env.NODE_ENV,
        routes: "initialized",
      },
      "Application initialized",
    );
  });

  app.addHook("onClose", async () => {
    logger.info({
      event: "APP_SHUTDOWN",
      context: "bootstrap",
    });
    await prisma.$disconnect();
  });

  // Routes (tudo aqui)
  await registerRoutes(app);

  return app;
}
