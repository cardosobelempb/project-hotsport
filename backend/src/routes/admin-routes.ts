import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

import { UnauthorizedError } from '../errors/index.js';
import { ErrorSchema, LoginResponseSchema, LoginSchema } from '../schemas/index.js';
import { LoginAdmin } from '../usecases/LoginAdmin.js';

export const adminRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/login',
    schema: {
      tags: ['Admin'],
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
        const useCase = new LoginAdmin();
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
};
