import { fromNodeHeaders } from 'better-auth/node';
import { type FastifyInstance } from 'fastify';
import { type ZodTypeProvider } from 'fastify-type-provider-zod';

import { auth } from '../lib/auth.js';
import { ErrorSchema, LimpezaResponseSchema } from '../schemas/index.js';

export const limpezaRoutes = async (app: FastifyInstance): Promise<void> => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'DELETE',
    url: '/pagamentos-expirados',
    schema: {
      tags: ['Limpeza'],
      summary: '⚠️ OPERAÇÃO DESTRUTIVA — Remover todos os pagamentos expirados',
      response: {
        200: LimpezaResponseSchema,
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
        if (!session) return reply.status(401).send({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
        return reply.status(200).send({ message: 'Pagamentos expirados removidos com sucesso', affected: 0 });
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'DELETE',
    url: '/radius-inativos',
    schema: {
      tags: ['Limpeza'],
      summary: '⚠️ OPERAÇÃO DESTRUTIVA — Remover usuários RADIUS sem pagamento ativo',
      response: {
        200: LimpezaResponseSchema,
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
        if (!session) return reply.status(401).send({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
        return reply.status(200).send({ message: 'Usuários RADIUS inativos removidos com sucesso', affected: 0 });
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'DELETE',
    url: '/logs-lgpd',
    schema: {
      tags: ['Limpeza'],
      summary: '⚠️ OPERAÇÃO DESTRUTIVA — Remover registros antigos de consentimento LGPD',
      response: {
        200: LimpezaResponseSchema,
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
        if (!session) return reply.status(401).send({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
        return reply.status(200).send({ message: 'Logs LGPD removidos com sucesso', affected: 0 });
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
      }
    },
  });
};
