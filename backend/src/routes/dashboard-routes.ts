import type { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { GetDashboardStats } from '../usecases/GetDashboardStats.js';
import { ErrorSchema, DashboardStatsSchema } from '../schemas/index.js';

export const dashboardRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/',
    schema: {
      tags: ['Dashboard'],
      summary: 'Obter estatísticas do dashboard',
      response: {
        200: DashboardStatsSchema,
        500: ErrorSchema,
      },
    },
    handler: async (_request, reply) => {
      try {
        const result = await new GetDashboardStats().execute();
        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ error: 'Erro interno', code: 'INTERNAL_SERVER_ERROR' });
      }
    },
  });
};
