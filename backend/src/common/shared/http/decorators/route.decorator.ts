// src/shared/http/decorators/route.decorators.ts

import { ZodType } from "zod";
import { addRoute } from "./metadata";
import type {
  HttpMethod,
  OpenApiParameter,
  OpenApiResponse,
  RouteDocs,
} from "./types";

// ─── Tipo de entrada do decorator (API pública simplificada) ──────────────────
//
// O desenvolvedor passa `body`, `params`, `responses` de forma ergonômica.
// O `buildOpenApiDocs` converte para o formato RouteDocs (OpenAPI 3.0).

type RouteDecoratorDocs = {
  tags?: string[];
  summary?: string;
  description?: string;

  /** Schema Zod do corpo da requisição. Use em POST, PUT, PATCH. */
  body?: ZodType;

  /** Parâmetros de path, query, header ou cookie. */
  params?: OpenApiParameter[];

  /** Respostas mapeadas por status HTTP. */
  responses?: Record<number, OpenApiResponse>;
};

// ─── Conversão para RouteDocs (OpenAPI 3.0) ───────────────────────────────────
//
// Centraliza a montagem do objeto OpenAPI.
// Nenhum decorator precisa conhecer o formato interno.

function buildOpenApiDocs(docs: RouteDecoratorDocs): RouteDocs {
  const result: RouteDocs = {};

  if (docs.tags) result.tags = docs.tags;
  if (docs.summary) result.summary = docs.summary;
  if (docs.description) result.description = docs.description;

  // requestBody — só adicionado quando `body` é fornecido
  if (docs.body) {
    result.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: docs.body,
        },
      },
    };
  }

  if (docs.params?.length) result.parameters = docs.params;
  if (docs.responses) result.responses = docs.responses;

  return result;
}

// ─── Factory de decorators ────────────────────────────────────────────────────

/**
 * Cria um decorator de rota HTTP com suporte a documentação OpenAPI.
 *
 * @example — Rota simples
 * @Get("/users")
 * async listar() {}
 *
 * @example — POST com body documentado
 * @Post("/users", {
 *   tags: ["Usuários"],
 *   summary: "Cria um usuário",
 *   body: CreateUserSchema,
 *   responses: {
 *     201: { description: "Criado", schema: UserResponseSchema },
 *     400: { description: "Dados inválidos" },
 *   },
 * })
 * async criar() {}
 *
 * @example — GET com parâmetro de path
 * @Get("/users/:id", {
 *   params: [{ name: "id", in: "path", required: true, schema: z.string().uuid() }],
 *   responses: { 200: { description: "OK", schema: UserResponseSchema } },
 * })
 * async buscar() {}
 */
function createRouteDecorator(method: HttpMethod) {
  return function (path: string = "", docs?: RouteDecoratorDocs) {
    return function (target: object, propertyKey: string | symbol): void {
      addRoute(target.constructor, {
        method,
        path,
        handlerName: String(propertyKey),
        ...(docs ? { docs: buildOpenApiDocs(docs) } : {}),
      });
    };
  };
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export const Get = createRouteDecorator("GET");
export const Post = createRouteDecorator("POST");
export const Put = createRouteDecorator("PUT");
export const Patch = createRouteDecorator("PATCH");
export const Delete = createRouteDecorator("DELETE");

export type { RouteDecoratorDocs };
