import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

import { NotFoundError } from '../errors/index.js';
import {
  ErrorSchema,
  MikrotikListSchema,
  MikrotikSchema,
  ParamsIdSchema,
} from '../schemas/index.js';

export const mikrotikRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/',
    schema: {
      tags: ['Mikrotiks'],
      summary: 'Listar todos os Mikrotiks',
      response: {
        200: MikrotikListSchema,
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
      tags: ['Mikrotiks'],
      summary: 'Buscar Mikrotik por ID',
      params: ParamsIdSchema,
      response: {
        200: MikrotikSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const { id } = request.params;
        void id;
        throw new NotFoundError('Mikrotik não encontrado');
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
      tags: ['Mikrotiks'],
      summary: 'Cadastrar novo Mikrotik',
      body: MikrotikSchema.omit({ id: true }),
      response: {
        201: MikrotikSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const data = request.body;
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
      tags: ['Mikrotiks'],
      summary: 'Atualizar Mikrotik',
      params: ParamsIdSchema,
      body: MikrotikSchema.omit({ id: true }).partial(),
      response: {
        200: MikrotikSchema,
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
        throw new NotFoundError('Mikrotik não encontrado');
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
      tags: ['Mikrotiks'],
      summary: 'Remover Mikrotik',
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
        throw new NotFoundError('Mikrotik não encontrado');
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
