import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

export const healthRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/',
    schema: {
      tags: ['Health'],
      summary: 'Verificar saúde da API',
      response: {
        200: z.object({ ok: z.boolean() }),
      },
    },
    handler: async (_request, reply) => {
      return reply.status(200).send({ ok: true });
    },
  });
};
