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
import { errorHandler } from "./middlewares/errorHandler.js";
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
    disableRequestLogging: true,
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

  // Zod compilers
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // CORS
  await app.register(fastifyCors, {
    origin: options.cors?.origin ?? env.ORIGIN,
    credentials: options.cors?.credentials ?? true,
  });

  const cookieSecret = env.COOKIE_SECRET;

  if (!cookieSecret) {
    throw new Error("Missing required environment variable: COOKIE_SECRET");
  }

  await app.register(fastifyCookie, {
    secret: cookieSecret, // para cookies assinados
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

  // Routes (tudo aqui)
  await registerRoutes(app);
  app.setErrorHandler(errorHandler); // ✅ sempre por último

  return app;
}
