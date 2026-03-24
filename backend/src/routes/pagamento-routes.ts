import type { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { GetPayments, ProcessPayment, UpdatePaymentStatus } from '../usecases/PaymentUseCases.js';
import {
  ErrorSchema,
  PagamentoSchema,
  CreatePagamentoSchema,
} from '../schemas/index.js';
import { NotFoundError } from '../errors/index.js';

export const pagamentoRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/',
    schema: {
      tags: ['Pagamentos'],
      summary: 'Listar todos os pagamentos',
      response: {
        200: z.array(PagamentoSchema),
        500: ErrorSchema,
      },
    },
    handler: async (_request, reply) => {
      try {
        const result = await new GetPayments().execute();
        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ error: 'Erro interno', code: 'INTERNAL_SERVER_ERROR' });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/',
    schema: {
      tags: ['Pagamentos'],
      summary: 'Registrar pagamento',
      body: CreatePagamentoSchema,
      response: {
        201: PagamentoSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const result = await new ProcessPayment().execute(request.body);
        return reply.status(201).send(result);
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ error: 'Erro interno', code: 'INTERNAL_SERVER_ERROR' });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'PATCH',
    url: '/:id/status',
    schema: {
      tags: ['Pagamentos'],
      summary: 'Atualizar status do pagamento',
      params: z.object({ id: z.coerce.number().int() }),
      body: z.object({ status: z.string().min(1) }),
      response: {
        200: PagamentoSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const result = await new UpdatePaymentStatus().execute({
          id: request.params.id,
          status: request.body.status,
        });
        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);
        if (error instanceof NotFoundError) {
          return reply.status(404).send({ error: error.message, code: error.code });
        }
        return reply.status(500).send({ error: 'Erro interno', code: 'INTERNAL_SERVER_ERROR' });
      }
    },
  });
};
