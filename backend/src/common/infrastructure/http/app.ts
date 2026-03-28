import fastifyCors from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import Fastify, { type FastifyInstance } from "fastify";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";

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
          ? { level: process.env.LOG_LEVEL ?? "info" }
          : {
              level: process.env.LOG_LEVEL ?? "debug",
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
    origin: options.cors?.origin ?? ["http://localhost:3000"],
    credentials: options.cors?.credentials ?? true,
  });

  // Swagger / OpenAPI
  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: options.swagger?.title ?? "Hotspot API",
        version: options.swagger?.version ?? "1.0.0",
        description:
          options.swagger?.description ?? "API do sistema de hotspot",
      },
    },
    transform: jsonSchemaTransform,
  });

  // Swagger UI
  await app.register(fastifySwaggerUi, { routePrefix: "/docs" });

  // Routes (tudo aqui)
  await registerRoutes(app);

  return app;
}
