import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

import { UnauthorizedError } from '../errors/index.js';
import { ErrorSchema, LoginResponseSchema, LoginSchema } from '../schemas/index.js';

export const authRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/login',
    schema: {
      tags: ['Auth'],
      summary: 'Autenticar administrador',
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

        throw new UnauthorizedError('Credenciais inválidas');
      } catch (error) {
        app.log.error(error);
        if (error instanceof UnauthorizedError) {
          return reply.status(401).send({ error: error.message, code: error.code });
        }
        return reply.status(500).send({ error: 'Erro interno no servidor', code: 'INTERNAL_SERVER_ERROR' });
      }
    },
  });
};
