// src/shared/http/types.ts

import type { ZodType } from "zod";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type UserRole = "admin" | "manager" | "support" | "user";

export type RateLimitWindow = "1s" | "1m" | "5m" | "15m" | "1h";

// ─── Tipos OpenAPI ─────────────────────────────────────────────────────────────

export type OpenApiParameter = {
  name: string;
  in: "path" | "query" | "header" | "cookie";
  required?: boolean;
  description?: string;
  schema: ZodType;
};

export type OpenApiResponse = {
  description: string;
  schema?: ZodType;
};

/**
 * Documentação OpenAPI 3.0 de uma rota.
 * Reflete exatamente o que será gerado no JSON do Swagger.
 */
export type RouteDocs = {
  tags?: string[];
  summary?: string;
  description?: string;

  // Montado pelo buildOpenApiDocs quando `body` for fornecido no decorator
  requestBody?: {
    required: boolean;
    content: {
      "application/json": {
        schema: ZodType;
      };
    };
  };

  // Parâmetros de path, query, header ou cookie
  parameters?: OpenApiParameter[];

  // Respostas mapeadas por status HTTP
  responses?: Record<number, OpenApiResponse>;
};

// ─── Definição de rota ────────────────────────────────────────────────────────

export type RouteDefinition = {
  method: HttpMethod;
  path: string;
  handlerName: string;

  // Schemas de validação em runtime (Zod via @Validate)
  schema?: {
    body?: ZodType;
    params?: ZodType;
    query?: ZodType;
    response?: ZodType;
  };

  // Documentação OpenAPI — gerada pelo decorator de rota
  docs?: RouteDocs;

  auth?: boolean;
  roles?: UserRole[];
  cache?: { ttl: number };
  rateLimit?: { max: number; window: RateLimitWindow };
  transaction?: boolean;
  pagination?: boolean;
};
