import type { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { NotFoundError } from '../errors/index.js';
import {
  CreateRadiusUserSchema,
  ErrorSchema,
  RadiusUserSchema,
} from '../schemas/index.js';
import { CreateRadiusUser, DeleteRadiusUser,GetRadiusUsers } from '../usecases/RadiusUseCases.js';

export const radiusRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/',
    schema: {
      tags: ['RADIUS'],
      summary: 'Listar usuários RADIUS',
      response: {
        200: z.array(RadiusUserSchema),
        500: ErrorSchema,
      },
    },
    handler: async (_request, reply) => {
      try {
        const result = await new GetRadiusUsers().execute();
        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ error: 'Erro interno', code: 'INTERNAL_SERVER_ERROR' });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/',
    schema: {
      tags: ['RADIUS'],
      summary: 'Criar usuário RADIUS',
      body: CreateRadiusUserSchema,
      response: {
        201: RadiusUserSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const body = request.body;
        const result = await new CreateRadiusUser().execute({
          username: body.username,
          password: body.password,
          planId: body.planId ?? null,
          nasId: body.nasId ?? null,
        });
        return reply.status(201).send(result);
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ error: 'Erro interno', code: 'INTERNAL_SERVER_ERROR' });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'DELETE',
    url: '/:id',
    schema: {
      tags: ['RADIUS'],
      summary: 'Deletar usuário RADIUS',
      params: z.object({ id: z.coerce.number().int() }),
      response: {
        204: z.null(),
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        await new DeleteRadiusUser().execute({ id: request.params.id });
        return reply.status(204).send(null);
      } catch (error) {
        app.log.error(error);
        if (error instanceof NotFoundError) {
          return reply.status(404).send({ error: error.message, code: error.code });
        }
        return reply.status(500).send({ error: 'Erro interno', code: 'INTERNAL_SERVER_ERROR' });
      }
    },
  });
};
