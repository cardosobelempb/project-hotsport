import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

import { NotFoundError } from '../errors/index.js';
import {
  ErrorSchema,
  ParamsIdSchema,
  PlanoListSchema,
  PlanoSchema,
} from '../schemas/index.js';

export const planRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/',
    schema: {
      tags: ['Planos'],
      summary: 'Listar todos os planos',
      response: {
        200: PlanoListSchema,
        500: ErrorSchema,
      },
    },
    handler: async (_request, reply) => {
      try {
        return reply.status(200).send([]);
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ error: 'Erro interno no servidor', code: 'INTERNAL_SERVER_ERROR' });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/:id',
    schema: {
      tags: ['Planos'],
      summary: 'Buscar plano por ID',
      params: ParamsIdSchema,
      response: {
        200: PlanoSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const { id } = request.params;
        void id;
        throw new NotFoundError('Plano não encontrado');
      } catch (error) {
        app.log.error(error);
        if (error instanceof NotFoundError) {
          return reply.status(404).send({ error: error.message, code: error.code });
        }
        return reply.status(500).send({ error: 'Erro interno no servidor', code: 'INTERNAL_SERVER_ERROR' });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/',
    schema: {
      tags: ['Planos'],
      summary: 'Criar novo plano',
      body: PlanoSchema.omit({ id: true }),
      response: {
        201: PlanoSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const data = request.body;
        void data;
        return reply.status(201).send({
          id: 'placeholder',
          ...data,
        });
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ error: 'Erro interno no servidor', code: 'INTERNAL_SERVER_ERROR' });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'PUT',
    url: '/:id',
    schema: {
      tags: ['Planos'],
      summary: 'Atualizar plano',
      params: ParamsIdSchema,
      body: PlanoSchema.omit({ id: true }).partial(),
      response: {
        200: PlanoSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const { id } = request.params;
        const data = request.body;
        void id;
        void data;
        throw new NotFoundError('Plano não encontrado');
      } catch (error) {
        app.log.error(error);
        if (error instanceof NotFoundError) {
          return reply.status(404).send({ error: error.message, code: error.code });
        }
        return reply.status(500).send({ error: 'Erro interno no servidor', code: 'INTERNAL_SERVER_ERROR' });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'DELETE',
    url: '/:id',
    schema: {
      tags: ['Planos'],
      summary: 'Remover plano',
      params: ParamsIdSchema,
      response: {
        200: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const { id } = request.params;
        void id;
        throw new NotFoundError('Plano não encontrado');
      } catch (error) {
        app.log.error(error);
        if (error instanceof NotFoundError) {
          return reply.status(404).send({ error: error.message, code: error.code });
        }
        return reply.status(500).send({ error: 'Erro interno no servidor', code: 'INTERNAL_SERVER_ERROR' });
      }
    },
  });
};
