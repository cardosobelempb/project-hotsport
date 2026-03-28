import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { DashboardStatsSchema } from "@/schemas/dashboard.js";
import { ErrorSchema } from "@/schemas/error.js";

import { GetDashboardStats } from "../usecases/GetDashboardStats.js";

export const dashboardRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/",
    schema: {
      tags: ["Dashboard"],
      summary: "Obter estatísticas do dashboard",
      response: {
        200: DashboardStatsSchema,
        500: ErrorSchema,
      },
    },
    handler: async (_request, reply) => {
      try {
        const dto = await new GetDashboardStats().execute();
        return reply.status(200).send({
          totalPlans: dto.totalPlans,
          totalMikrotiks: dto.totalMikrotiks,
          totalPayments: dto.totalPayments,
          totalRadiusUsers: dto.totalRadiusUsers,
          approvedPayments: dto.approvedPayments,
          totalRevenue: dto.totalRevenue,
        });
      } catch (error) {
        app.log.error(error);
        return reply
          .status(500)
          .send({ error: "Erro interno", code: "INTERNAL_SERVER_ERROR" });
      }
    },
  });
};
