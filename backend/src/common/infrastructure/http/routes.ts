import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod/v4";

import { adminRouter } from "@/admin";
import { registerPaymentRoutes } from "@/modulos/payment/presentation/routes/payment.routes";
import { authRoutes } from "@/routes/auth-routes";
import { dashboardRoutes } from "@/routes/dashboard-routes";
import { efiRoutes } from "@/routes/efi-routes";
import { lgpdRoutes } from "@/routes/lgpd-routes";
import { meRoutes } from "@/routes/me-routes";
import { mercadoPagoRoutes } from "@/routes/mercadopago-routes";
import { mikrotikRoutes } from "@/routes/mikrotik-routes";
import { otpRoutes } from "@/routes/otp-routes";
import { planRoutes } from "@/routes/plan-routes";
import { radiusRoutes } from "@/routes/radius-routes";

export async function registerRoutes(app: FastifyInstance): Promise<void> {
  // Home / Hello World
  await app.register(async (app: FastifyInstance) => {
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
  });

  // API routes
  await app.register(authRoutes, { prefix: "/api/auth" });
  await app.register(adminRouter, { prefix: "/api/admin" });
  await app.register(meRoutes, { prefix: "/api" });
  await app.register(planRoutes, { prefix: "/api/planos" });
  await app.register(mikrotikRoutes, { prefix: "/api/mikrotiks" });
  await app.register(registerPaymentRoutes, { prefix: "/api/payments" });
  await app.register(radiusRoutes, { prefix: "/api/radius" });
  await app.register(otpRoutes, { prefix: "/auth/otp" });
  await app.register(dashboardRoutes, { prefix: "/api/dashboard" });
  await app.register(lgpdRoutes, { prefix: "/api/lgpd" });
  await app.register(efiRoutes, { prefix: "/api/efi" });
  await app.register(mercadoPagoRoutes, { prefix: "/api/config-mercadopago" });

  // Swagger JSON route (fica aqui porque depende de app.swagger())
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/swagger.json",
    schema: { hide: true },
    handler: async () => app.swagger(),
  });
}
