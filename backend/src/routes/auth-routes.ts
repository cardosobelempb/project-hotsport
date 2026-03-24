import type { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { loginAdminHandler } from '../handlers/admin/login.js';
import { ErrorSchema, LoginSchema, LoginOutputSchema } from '../schemas/index.js';

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
    handler: loginAdminHandler,
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
