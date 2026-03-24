import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

import { DashboardStatsSchema, ErrorSchema } from '../schemas/index.js';
import { GetDashboardStats } from '../usecases/GetDashboardStats.js';

export const dashboardRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/',
    schema: {
      tags: ['Dashboard'],
      summary: 'Buscar estatísticas do dashboard',
      response: {
        200: DashboardStatsSchema,
        500: ErrorSchema,
      },
    },
    handler: async (_request, reply) => {
      try {
        const useCase = new GetDashboardStats();
        const result = await useCase.execute();
        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ error: 'Erro interno no servidor', code: 'INTERNAL_SERVER_ERROR' });
      }
    },
  });
};
