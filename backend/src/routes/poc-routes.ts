import { fromNodeHeaders } from 'better-auth/node';
import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { UnauthorizedError } from '../errors/index.js';
import { auth } from '../lib/auth.js';
import { ErrorSchema, ParamsIdSchema } from '../schemas/index.js';
import { GetPocResource } from '../usecases/GetPocResource.js';

const PocResourceSchema = z.object({
  id: z.string(),
  nome: z.string(),
});

export const pocRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/recurso/:id',
    schema: {
      tags: ['PoC'],
      summary: 'Demonstra error handler padronizado (404 / 401)',
      params: ParamsIdSchema,
      response: {
        200: PocResourceSchema,
        401: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(request.headers),
      });

      if (!session) {
        throw new UnauthorizedError();
      }

      const useCase = new GetPocResource();
      const result = await useCase.execute({ id: request.params.id });
      return reply.status(200).send(result);
    },
  });
};
