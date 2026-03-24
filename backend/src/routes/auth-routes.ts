import type { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { AuthenticateAdmin } from '../usecases/AuthenticateAdmin.js';
import { ErrorSchema, LoginSchema, LoginOutputSchema } from '../schemas/index.js';
import { UnauthorizedError } from '../errors/index.js';

export const authRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/login',
    schema: {
      tags: ['Auth'],
      summary: 'Autenticar administrador',
      body: LoginSchema,
      response: {
        200: LoginOutputSchema,
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const useCase = new AuthenticateAdmin();
        const result = await useCase.execute(request.body);
        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);
        if (error instanceof UnauthorizedError) {
          return reply.status(401).send({ error: error.message, code: error.code });
        }
        return reply.status(500).send({ error: 'Erro interno no servidor', code: 'INTERNAL_SERVER_ERROR' });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/me',
    schema: {
      tags: ['Auth'],
      summary: 'Verificar token JWT',
      headers: z.object({
        authorization: z.string(),
      }),
      response: {
        200: z.object({ valid: z.boolean() }),
        401: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const authHeader = request.headers['authorization'];
      if (!authHeader) {
        return reply.status(401).send({ error: 'Token não fornecido', code: 'UNAUTHORIZED_ERROR' });
      }
      return reply.status(200).send({ valid: true });
    },
  });
};
