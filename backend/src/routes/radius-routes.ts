import { fromNodeHeaders } from 'better-auth/node';
import { type FastifyInstance } from 'fastify';
import { type ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { NotFoundError } from '../errors/index.js';
import { auth } from '../lib/auth.js';
import { ErrorSchema, MessageSchema,RadiusUserSchema } from '../schemas/index.js';

export const radiusRoutes = async (app: FastifyInstance): Promise<void> => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/',
    schema: {
      tags: ['Radius'],
      summary: 'Listar todos os usuários RADIUS cadastrados',
      response: {
        200: z.array(RadiusUserSchema),
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
    url: '/',
    schema: {
      tags: ['Radius'],
      summary: 'Criar usuário RADIUS',
      body: z.object({
        username: z.string().min(1),
        plano_id: z.number().int().nullable().optional(),
        nas_id: z.number().int().nullable().optional(),
      }),
      response: {
        201: RadiusUserSchema,
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
        if (!session) return reply.status(401).send({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
        return reply.status(201).send({
          id: 1,
          username: request.body.username,
          plano_id: request.body.plano_id ?? null,
          nas_id: request.body.nas_id ?? null,
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
      tags: ['Radius'],
      summary: 'Remover usuário RADIUS',
      params: z.object({ id: z.coerce.number().int() }),
      response: {
        200: MessageSchema,
        401: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
        if (!session) return reply.status(401).send({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
        return reply.status(200).send({ message: 'Usuário RADIUS removido com sucesso' });
      } catch (error) {
        app.log.error(error);
        if (error instanceof NotFoundError) return reply.status(404).send({ error: error.message, code: error.code });
        return reply.status(500).send({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
      }
    },
  });
};
