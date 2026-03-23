import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

import { DashboardStatsSchema, ErrorSchema } from '../schemas/index.js';

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
        return reply.status(200).send({
          total_clientes: 0,
          planos_ativos: 0,
          receita_mensal: 0,
          conexoes_ativas: 0,
          pagamentos_pendentes: 0,
        });
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ error: 'Erro interno no servidor', code: 'INTERNAL_SERVER_ERROR' });
      }
    },
  });
};
