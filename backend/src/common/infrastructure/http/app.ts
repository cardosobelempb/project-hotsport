import fastifyCors from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import Fastify, { type FastifyInstance } from "fastify";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";

import { registerRoutes } from "./routes";

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
  const app = Fastify({ logger: options.logger ?? true });

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
