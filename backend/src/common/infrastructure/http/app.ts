import fastifyCors from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import Fastify, { type FastifyInstance } from "fastify";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";

import fastifyCookie from "@fastify/cookie";

import { env } from "../env/index.js";
import { fromFastifyLogger } from "../observability/logger.js";

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

  // Logger da aplicação usando o Fastify como base
  const logger = fromFastifyLogger(app.log);

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

  // Swagger / OpenAPI
  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: options.swagger?.title ?? env.TITLE,
        version: options.swagger?.version ?? env.VERSION,
        description: options.swagger?.description ?? env.DESCRIPTION,
      },
    },
    transform: jsonSchemaTransform,
  });

  // Swagger UI
  await app.register(fastifySwaggerUi, { routePrefix: "/docs" });

  // Disponibiliza logger e prisma via decorator para toda a aplicação
  app.decorate("logger", logger);
  app.decorate("prisma", prisma);

  // Loga inicialização dos plugins
  app.addHook("onReady", async () => {
    logger.info({}, "Aplicação pronta");
  });

  app.addHook("onClose", async () => {
    logger.info({}, "Aplicação encerrando...");
    await prisma.$disconnect();
  });

  // Routes (tudo aqui)
  await registerRoutes(app);

  return app;
}
