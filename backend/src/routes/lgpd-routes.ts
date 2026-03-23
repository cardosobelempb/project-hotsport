import dayjs from 'dayjs';
import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

import { ErrorSchema, LgpdSchema } from '../schemas/index.js';

export const lgpdRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/',
    schema: {
      tags: ['LGPD'],
      summary: 'Registrar aceite de termos LGPD',
      body: LgpdSchema.omit({ aceito_em: true }),
      response: {
        201: LgpdSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const data = request.body;
        return reply.status(201).send({
          ...data,
          aceito_em: dayjs().toISOString(),
        });
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ error: 'Erro interno no servidor', code: 'INTERNAL_SERVER_ERROR' });
      }
    },
  });
};
