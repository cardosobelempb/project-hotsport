import { authRoutes } from "@/modulos/auth/infrastructure/http/routes/auth.routes";
import { accountRoutes } from "@/modulos/identity/infrastructure/http/routes/account.routes";
import { userRoutes } from "@/modulos/identity/infrastructure/http/routes/user.routes";
import { mikrotikRoutes } from "@/modulos/network/mikrotik/infrastructure/http/routes/mikrtik.routes";
import { oerganizationRoutes } from "@/modulos/organization/infrastructure/http/routers/organization.routes";
import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

export async function registerRoutes(app: FastifyInstance): Promise<void> {
  // Home / Hello World

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/",
    schema: {
      summary: "Retorna uma mensagem de saudação",
      description: "Hello World route",
      tags: ["Hello World"],
      response: { 200: z.object({ message: z.string() }) },
    },
    handler: () => ({ message: "Hello World" }),
  });

  // API routes
  await app.register(accountRoutes, { prefix: "/api/accounts" });
  await app.register(authRoutes, { prefix: "/api/auth" });
  await app.register(userRoutes, { prefix: "/api/users" });
  await app.register(mikrotikRoutes, { prefix: "/api/mikrotiks" });
  await app.register(oerganizationRoutes, { prefix: "/api/organizations" });
}
