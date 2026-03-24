import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

import { ErrorSchema, StatusSchema } from '../schemas/index.js';
import { GetStatus } from '../usecases/GetStatus.js';

export const statusRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/',
    schema: {
      tags: ['Status'],
      summary: 'Verificar status da API',
      response: {
        200: StatusSchema,
        500: ErrorSchema,
      },
    },
    handler: async (_request, reply) => {
      try {
        const useCase = new GetStatus();
        const result = await useCase.execute();
        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ error: 'Erro interno no servidor', code: 'INTERNAL_SERVER_ERROR' });
      }
    },
  });
};
