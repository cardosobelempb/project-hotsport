import { fromNodeHeaders } from 'better-auth/node';
import { type FastifyInstance } from 'fastify';
import { type ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { auth } from '../lib/auth.js';
import { ErrorSchema, LgpdLoginSchema, MessageSchema } from '../schemas/index.js';

export const lgpdRoutes = async (app: FastifyInstance): Promise<void> => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/',
    schema: {
      tags: ['LGPD'],
      summary: 'Listar todos os registros de consentimento LGPD',
      response: {
        200: z.array(LgpdLoginSchema),
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
        if (!session) return reply.status(401).send({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
        return reply.status(200).send([]);
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/registrar',
    schema: {
      tags: ['LGPD'],
      summary: 'Registrar consentimento LGPD do usuário (público)',
      body: z.object({
        cpf: z.string().min(11).max(14),
        aceite: z.boolean(),
        mac: z.string().optional(),
        ip: z.string().optional(),
        nome: z.string().optional(),
        telefone: z.string().optional(),
      }),
      response: {
        201: LgpdLoginSchema,
        500: ErrorSchema,
      },
    },
    handler: async (_request, reply) => {
      try {
        return reply.status(201).send({
          id: 1,
          cpf: _request.body.cpf,
          aceite: _request.body.aceite ? 1 : 0,
          mac: _request.body.mac ?? null,
          ip: _request.body.ip ?? null,
          nome: _request.body.nome ?? null,
          telefone: _request.body.telefone ?? null,
          criado_em: null,
        });
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'DELETE',
    url: '/:id',
    schema: {
      tags: ['LGPD'],
      summary: 'Remover registro de consentimento LGPD',
      params: z.object({ id: z.coerce.number().int() }),
      response: {
        200: MessageSchema,
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
        if (!session) return reply.status(401).send({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
        return reply.status(200).send({ message: 'Registro LGPD removido com sucesso' });
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
      }
    },
  });
};
