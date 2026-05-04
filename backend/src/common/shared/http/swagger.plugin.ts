// shared/http/swagger.plugin.ts

import { env } from "@/common/infrastructure/env";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { jsonSchemaTransform } from "fastify-type-provider-zod";

export type BuildAppOptions = {
  swagger?: {
    title: string;
    version: string;
    description?: string;
  };
};

export async function swaggerPlugin(
  app: FastifyInstance,
  options: BuildAppOptions = {},
): Promise<void> {
  await app.register(swagger, {
    openapi: {
      info: {
        title: options.swagger?.title ?? env.TITLE,
        version: options.swagger?.version ?? env.VERSION,
        description: options.swagger?.description ?? env.DESCRIPTION,
      },
    },
    transform: jsonSchemaTransform,
  });

  await app.register(swaggerUI, {
    routePrefix: "/docs",
  });
}

export default fp(swaggerPlugin);

// Swagger / OpenAPI
// await app.register(fastifySwagger, {
//   openapi: {
//     info: {
//       title: options.swagger?.title ?? env.TITLE,
//       version: options.swagger?.version ?? env.VERSION,
//       description: options.swagger?.description ?? env.DESCRIPTION,
//     },
//   },
//   transform: jsonSchemaTransform,
// });

// Swagger UI
// await app.register(fastifySwaggerUi, { routePrefix: "/docs" });
