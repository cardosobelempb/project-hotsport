// src/shared/http/register-routes.ts

import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type {
  OpenApiResponse,
  RouteDefinition,
} from "../http/decorators/types";
import { getControllerPrefix, getRoutes } from "./decorators/metadata";

// ─── Cache e Rate Limit em memória ───────────────────────────────────────────

const memoryCache = new Map<string, { expiresAt: number; data: unknown }>();
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseWindowToMs(window: string): number {
  const value = Number(window.slice(0, -1));
  const unit = window.slice(-1);
  const units: Record<string, number> = { s: 1000, m: 60_000, h: 3_600_000 };
  return value * (units[unit] ?? 1000);
}

function createCacheKey(request: FastifyRequest): string {
  return `${request.method}:${request.url}`;
}

function createRateLimitKey(request: FastifyRequest): string {
  return `${request.ip}:${request.method}:${request.url}`;
}

function normalizePagination(request: FastifyRequest): void {
  const query = request.query as Record<string, unknown>;
  const page = Math.max(Number(query.page ?? 1), 1);
  const limit = Math.min(Math.max(Number(query.limit ?? 10), 1), 100);
  request.query = { ...query, page, limit, skip: (page - 1) * limit };
}

// ─── Schema Fastify/Swagger ───────────────────────────────────────────────────

function buildFastifySchema(route: RouteDefinition): Record<string, unknown> {
  const { docs, schema } = route;

  if (!docs && !schema) return {};

  const fastifySchema: Record<string, unknown> = {};

  if (docs?.tags) fastifySchema.tags = docs.tags;
  if (docs?.summary) fastifySchema.summary = docs.summary;
  if (docs?.description) fastifySchema.description = docs.description;

  const bodySchema =
    docs?.requestBody?.content?.["application/json"]?.schema ?? schema?.body;

  if (bodySchema) fastifySchema.body = bodySchema;
  if (schema?.params) fastifySchema.params = schema.params;
  if (schema?.query) fastifySchema.querystring = schema.query;

  const responses = buildResponseSchema(docs?.responses);
  if (responses) fastifySchema.response = responses;

  return fastifySchema;
}

function buildResponseSchema(
  responses?: Record<number, OpenApiResponse>,
): Record<number, unknown> | null {
  if (!responses) return null;

  const result: Record<number, unknown> = {};
  let hasSchema = false;

  for (const [status, response] of Object.entries(responses)) {
    if (response.schema) {
      result[Number(status)] = response.schema;
      hasSchema = true;
    }
  }

  return hasSchema ? result : null;
}

// ─── Registro interno (sem prefix) ───────────────────────────────────────────

async function registerInRouter(
  router: FastifyInstance,
  controllers: object[],
): Promise<void> {
  for (const controller of controllers) {
    const controllerClass = controller.constructor;
    const controllerPrefix = getControllerPrefix(controllerClass); // ← nome único
    const routes = getRoutes(controllerClass);

    for (const route of routes) {
      // Concatena: controllerPrefix (@Controller) + route.path (@Get/@Post…)
      const url = `${controllerPrefix}${route.path}`.replace(/\/+/g, "/");
      const fastifySchema = buildFastifySchema(route);

      router.route({
        method: route.method,
        url,
        ...(Object.keys(fastifySchema).length ? { schema: fastifySchema } : {}),

        handler: async (request: FastifyRequest, reply: FastifyReply) => {
          // ── Rate Limit ──────────────────────────────────────────────────
          if (route.rateLimit) {
            const key = createRateLimitKey(request);
            const now = Date.now();
            const windowMs = parseWindowToMs(route.rateLimit.window);
            const current = rateLimitStore.get(key);

            if (!current || current.resetAt < now) {
              rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
            } else {
              current.count++;
              if (current.count > route.rateLimit.max) {
                return reply.status(429).send({
                  message: "Muitas requisições. Tente novamente mais tarde.",
                });
              }
            }
          }

          // ── Auth + Roles ────────────────────────────────────────────────
          if (route.auth || route.roles) {
            const user = { id: "123", name: "Usuário de Teste", role: "admin" };

            if (!user) {
              return reply.status(401).send({ message: "Não autenticado" });
            }

            if (route.roles && !route.roles.includes(user.role as never)) {
              return reply.status(403).send({ message: "Acesso negado" });
            }
          }

          // ── Paginação ───────────────────────────────────────────────────
          if (route.pagination) {
            normalizePagination(request);
          }

          // ── Cache (GET) ─────────────────────────────────────────────────
          const cacheKey = createCacheKey(request);

          if (route.cache && route.method === "GET") {
            const cached = memoryCache.get(cacheKey);
            if (cached && cached.expiresAt > Date.now()) {
              return reply.send(cached.data);
            }
          }

          // ── Handler ─────────────────────────────────────────────────────
          const handler =
            controller[route.handlerName as keyof typeof controller];

          if (typeof handler !== "function") {
            throw new Error(`Handler "${route.handlerName}" não encontrado`);
          }

          const result = await (handler as Function).call(
            controller,
            request,
            reply,
          );

          if (route.cache && route.method === "GET") {
            memoryCache.set(cacheKey, {
              expiresAt: Date.now() + route.cache.ttl * 1000,
              data: result,
            });
          }

          if (!reply.sent) {
            return reply.send(result);
          }
        },
      });
    }
  }
}

// ─── Registro público (com prefix opcional) ───────────────────────────────────
//
// Com prefix:    app.register(router => ..., { prefix }) → Fastify isola o escopo
// Sem prefix:    registra direto no app
//
// Resultado final da URL:
//   prefix (/api/v1)  +  @Controller (/users)  +  @Post (/)
//   → /api/v1/users/

export async function registerControllers(
  app: FastifyInstance,
  controllers: object[],
  prefix?: string,
): Promise<void> {
  if (prefix) {
    await app.register(
      (router, _opts, done) => {
        registerInRouter(router, controllers)
          .then(() => done())
          .catch((err) => done(err));
      },
      { prefix },
    );
  } else {
    await registerInRouter(app, controllers);
  }
}