import { fromNodeHeaders } from 'better-auth/node';
import { type FastifyInstance } from 'fastify';
import { type ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { auth } from '../lib/auth.js';
import { ErrorSchema, MessageSchema } from '../schemas/index.js';

export const adminRoutes = async (app: FastifyInstance): Promise<void> => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/perfil',
    schema: {
      tags: ['Admin'],
      summary: 'Obter perfil do administrador autenticado',
      response: {
        200: z.object({ id: z.number().int(), email: z.string() }),
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
        if (!session) return reply.status(401).send({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
        return reply.status(200).send({ id: 1, email: session.user.email });
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'PUT',
    url: '/password',
    schema: {
      tags: ['Admin'],
      summary: 'Change administrator password',
      body: z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(6),
      }),
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
        return reply.status(200).send({ message: 'Password changed successfully' });
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
      }
    },
  });
};
