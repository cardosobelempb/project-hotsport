import { fromNodeHeaders } from 'better-auth/node';
import { type FastifyInstance } from 'fastify';
import { type ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { NotFoundError } from '../errors/index.js';
import { auth } from '../lib/auth.js';
import { ErrorSchema, MessageSchema,PlanoCreateSchema, PlanoSchema } from '../schemas/index.js';

export const planosRoutes = async (app: FastifyInstance): Promise<void> => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/',
    schema: {
      tags: ['Planos'],
      summary: 'Listar todos os planos de internet',
      response: {
        200: z.array(PlanoSchema),
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
    method: 'GET',
    url: '/:id',
    schema: {
      tags: ['Planos'],
      summary: 'Buscar plano por ID',
      params: z.object({ id: z.coerce.number().int() }),
      response: {
        200: PlanoSchema,
        401: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
        if (!session) return reply.status(401).send({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
        throw new NotFoundError('Plano não encontrado');
      } catch (error) {
        app.log.error(error);
        if (error instanceof NotFoundError) return reply.status(404).send({ error: error.message, code: error.code });
        return reply.status(500).send({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/',
    schema: {
      tags: ['Planos'],
      summary: 'Criar novo plano de internet',
      body: PlanoCreateSchema,
      response: {
        201: PlanoSchema,
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
        if (!session) return reply.status(401).send({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
        return reply.status(201).send({ ...request.body, id: 1 });
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'PUT',
    url: '/:id',
    schema: {
      tags: ['Planos'],
      summary: 'Atualizar plano de internet',
      params: z.object({ id: z.coerce.number().int() }),
      body: PlanoCreateSchema,
      response: {
        200: PlanoSchema,
        401: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
        if (!session) return reply.status(401).send({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
        return reply.status(200).send({ ...request.body, id: request.params.id });
      } catch (error) {
        app.log.error(error);
        if (error instanceof NotFoundError) return reply.status(404).send({ error: error.message, code: error.code });
        return reply.status(500).send({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'DELETE',
    url: '/:id',
    schema: {
      tags: ['Planos'],
      summary: 'Remover plano de internet',
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
        return reply.status(200).send({ message: 'Plano removido com sucesso' });
      } catch (error) {
        app.log.error(error);
        if (error instanceof NotFoundError) return reply.status(404).send({ error: error.message, code: error.code });
        return reply.status(500).send({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
      }
    },
  });
};
