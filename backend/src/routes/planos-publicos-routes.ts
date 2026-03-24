import { type FastifyInstance } from 'fastify';
import { type ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { ErrorSchema, PlanoSchema } from '../schemas/index.js';

export const planosPublicosRoutes = async (app: FastifyInstance): Promise<void> => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/',
    schema: {
      tags: ['Planos Públicos'],
      summary: 'Listar planos disponíveis para clientes (sem autenticação)',
      response: {
        200: z.array(PlanoSchema),
        500: ErrorSchema,
      },
    },
    handler: async (_request, reply) => {
      try {
        return reply.status(200).send([]);
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/:id',
    schema: {
      tags: ['Planos Públicos'],
      summary: 'Buscar plano público por ID',
      params: z.object({ id: z.coerce.number().int() }),
      response: {
        200: PlanoSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        void request.params.id;
        return reply.status(404).send({ error: 'Plano não encontrado', code: 'NOT_FOUND_ERROR' });
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
      }
    },
  });
};
