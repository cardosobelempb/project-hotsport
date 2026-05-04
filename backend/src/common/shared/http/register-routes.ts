// src/shared/http/register-routes.ts

import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { getControllerPrefix, getRoutes } from "./decorators/metadata";

const memoryCache = new Map<
  string,
  {
    expiresAt: number;
    data: unknown;
  }
>();

const rateLimitStore = new Map<
  string,
  {
    count: number;
    resetAt: number;
  }
>();

function parseWindowToMs(window: string): number {
  const value = Number(window.slice(0, -1));
  const unit = window.slice(-1);

  const units: Record<string, number> = {
    s: 1000,
    m: 60_000,
    h: 3_600_000,
  };

  return value * (units[unit] ?? 1000);
}

function createCacheKey(request: FastifyRequest): string {
  return `${request.method}:${request.url}`;
}

function createRateLimitKey(request: FastifyRequest): string {
  const ip = request.ip;

  return `${ip}:${request.method}:${request.url}`;
}

function normalizePagination(request: FastifyRequest): void {
  const query = request.query as Record<string, unknown>;

  const page = Math.max(Number(query.page ?? 1), 1);
  const limit = Math.min(Math.max(Number(query.limit ?? 10), 1), 100);

  request.query = {
    ...query,
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

export async function registerControllers(
  app: FastifyInstance,
  controllers: object[],
): Promise<void> {
  for (const controller of controllers) {
    const controllerClass = controller.constructor;
    const prefix = getControllerPrefix(controllerClass);
    const routes = getRoutes(controllerClass);

    for (const route of routes) {
      app.route({
        method: route.method,
        url: `${prefix}${route.path}`.replace(/\/+/g, "/"),

        handler: async (request: FastifyRequest, reply: FastifyReply) => {
          /**
           * Rate Limit
           */
          if (route.rateLimit) {
            const key = createRateLimitKey(request);
            const now = Date.now();
            const windowMs = parseWindowToMs(route.rateLimit.window);

            const current = rateLimitStore.get(key);

            if (!current || current.resetAt < now) {
              rateLimitStore.set(key, {
                count: 1,
                resetAt: now + windowMs,
              });
            } else {
              current.count++;

              if (current.count > route.rateLimit.max) {
                return reply.status(429).send({
                  message: "Muitas requisições. Tente novamente mais tarde.",
                });
              }
            }
          }

          /**
           * Auth + Roles
           *
           * Em produção, substitua este mock por JWT real.
           */
          if (route.auth || route.roles) {
            const user = {
              id: "123",
              name: "Usuário de Teste",
              role: "admin", // ou "user"
            };

            if (!user) {
              return reply.status(401).send({
                message: "Não autenticado",
              });
            }

            if (route.roles && !route.roles.includes(user.role as never)) {
              return reply.status(403).send({
                message: "Acesso negado",
              });
            }
          }

          /**
           * Paginação
           */
          if (route.pagination) {
            normalizePagination(request);
          }

          /**
           * Cache
           */
          const cacheKey = createCacheKey(request);

          if (route.cache && route.method === "GET") {
            const cached = memoryCache.get(cacheKey);

            if (cached && cached.expiresAt > Date.now()) {
              return reply.send(cached.data);
            }
          }

          const handler =
            controller[route.handlerName as keyof typeof controller];

          if (typeof handler !== "function") {
            throw new Error(`Handler ${route.handlerName} não encontrado`);
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
