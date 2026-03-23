import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

import { ErrorSchema, RadiusSchema } from '../schemas/index.js';

export const radiusRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/',
    schema: {
      tags: ['Radius'],
      summary: 'Criar usuário Radius',
      body: RadiusSchema,
      response: {
        201: RadiusSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const data = request.body;
        return reply.status(201).send(data);
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ error: 'Erro interno no servidor', code: 'INTERNAL_SERVER_ERROR' });
      }
    },
  });
};
