import dayjs from 'dayjs';
import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

import { NotFoundError } from '../errors/index.js';
import {
  ErrorSchema,
  PagamentoListSchema,
  PagamentoSchema,
  ParamsIdSchema,
} from '../schemas/index.js';

export const paymentRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/',
    schema: {
      tags: ['Pagamentos'],
      summary: 'Listar todos os pagamentos',
      response: {
        200: PagamentoListSchema,
        500: ErrorSchema,
      },
    },
    handler: async (_request, reply) => {
      try {
        return reply.status(200).send([]);
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ error: 'Erro interno no servidor', code: 'INTERNAL_SERVER_ERROR' });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/:id',
    schema: {
      tags: ['Pagamentos'],
      summary: 'Buscar pagamento por ID',
      params: ParamsIdSchema,
      response: {
        200: PagamentoSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const { id } = request.params;
        void id;
        throw new NotFoundError('Pagamento não encontrado');
      } catch (error) {
        app.log.error(error);
        if (error instanceof NotFoundError) {
          return reply.status(404).send({ error: error.message, code: error.code });
        }
        return reply.status(500).send({ error: 'Erro interno no servidor', code: 'INTERNAL_SERVER_ERROR' });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/',
    schema: {
      tags: ['Pagamentos'],
      summary: 'Registrar novo pagamento',
      body: PagamentoSchema.omit({ id: true, createdAt: true }),
      response: {
        201: PagamentoSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const data = request.body;
        return reply.status(201).send({
          id: 0,
          createdAt: dayjs().toISOString(),
          ...data,
        });
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ error: 'Erro interno no servidor', code: 'INTERNAL_SERVER_ERROR' });
      }
    },
  });
};
