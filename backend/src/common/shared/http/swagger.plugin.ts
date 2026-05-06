// shared/http/swagger.plugin.ts

import { env } from "@/common/infrastructure/env";
import swagger from "@fastify/swagger";
import scalarReference from "@scalar/fastify-api-reference";
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
  // ── 1. Gera o spec OpenAPI ─────────────────────────────────────────────────
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

  // ── 2. Serve a UI via Scalar ───────────────────────────────────────────────
  //
  // @scalar/fastify-api-reference v1.55+ mudou a API:
  //   - `configuration.spec` foi REMOVIDO
  //   - A URL do spec vai em `configuration.url` (nível raiz da configuration)
  //   - Quando @fastify/swagger está registrado, o Scalar o detecta automaticamente
  //     e não precisa de `url` — basta não informar nada em `configuration.url`
  //
  // Import dinâmico obrigatório: pacote é ESM puro, projeto é CJS.

  await app.register(scalarReference, {
    routePrefix: "/docs",

    // ⚠️  Não passe `configuration.spec` — não existe mais na v1.55+
    // O Scalar detecta o @fastify/swagger automaticamente via hook interno.
    configuration: {
      theme: "deepSpace",
    },
  });
}

export default fp(swaggerPlugin);