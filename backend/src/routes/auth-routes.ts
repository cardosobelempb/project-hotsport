import { fromNodeHeaders } from 'better-auth/node';
import { type FastifyInstance } from 'fastify';
import { type ZodTypeProvider } from 'fastify-type-provider-zod';

import { UnauthorizedError } from '../errors/index.js';
import { auth } from '../lib/auth.js';
import { ErrorSchema, LoginResponseSchema,LoginSchema } from '../schemas/index.js';

export const authRoutes = async (app: FastifyInstance): Promise<void> => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/login',
    schema: {
      tags: ['Auth'],
      summary: 'Autenticar administrador e obter token JWT',
      body: LoginSchema,
      response: {
        200: LoginResponseSchema,
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const { email, senha } = request.body;
        void email;
        void senha;
        return reply.status(200).send({ token: 'placeholder' });
      } catch (error) {
        app.log.error(error);
        if (error instanceof UnauthorizedError) {
          return reply.status(401).send({ error: error.message, code: error.code });
        }
        return reply.status(500).send({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/logout',
    schema: {
      tags: ['Auth'],
      summary: 'Encerrar sessão do administrador',
      response: {
        200: { type: 'object', properties: { message: { type: 'string' } } },
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
        if (!session) {
          return reply.status(401).send({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
        }
        return reply.status(200).send({ message: 'Logout realizado com sucesso' });
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/me',
    schema: {
      tags: ['Auth'],
      summary: 'Obter dados da sessão autenticada atual',
      response: {
        200: { type: 'object', properties: { id: { type: 'string' }, email: { type: 'string' } } },
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
        if (!session) {
          return reply.status(401).send({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
        }
        return reply.status(200).send({ id: session.user.id, email: session.user.email });
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
      }
    },
  });
};
