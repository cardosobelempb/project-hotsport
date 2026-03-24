import type { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import {
  GetMikrotiks,
  GetMikrotik,
  CreateMikrotik,
  UpdateMikrotik,
  DeleteMikrotik,
} from '../usecases/MikrotikUseCases.js';
import {
  ErrorSchema,
  MikrotikSchema,
  CreateMikrotikSchema,
  UpdateMikrotikSchema,
} from '../schemas/index.js';
import { NotFoundError } from '../errors/index.js';

export const mikrotikRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/',
    schema: {
      tags: ['Mikrotiks'],
      summary: 'Listar todos os mikrotiks',
      response: {
        200: z.array(MikrotikSchema),
        500: ErrorSchema,
      },
    },
    handler: async (_request, reply) => {
      try {
        const result = await new GetMikrotiks().execute();
        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ error: 'Erro interno', code: 'INTERNAL_SERVER_ERROR' });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/:id',
    schema: {
      tags: ['Mikrotiks'],
      summary: 'Buscar mikrotik por ID',
      params: z.object({ id: z.coerce.number().int() }),
      response: {
        200: MikrotikSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const result = await new GetMikrotik().execute(request.params.id);
        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);
        if (error instanceof NotFoundError) {
          return reply.status(404).send({ error: error.message, code: error.code });
        }
        return reply.status(500).send({ error: 'Erro interno', code: 'INTERNAL_SERVER_ERROR' });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/',
    schema: {
      tags: ['Mikrotiks'],
      summary: 'Criar mikrotik',
      body: CreateMikrotikSchema,
      response: {
        201: MikrotikSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const result = await new CreateMikrotik().execute(request.body);
        return reply.status(201).send(result);
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ error: 'Erro interno', code: 'INTERNAL_SERVER_ERROR' });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'PUT',
    url: '/:id',
    schema: {
      tags: ['Mikrotiks'],
      summary: 'Atualizar mikrotik',
      params: z.object({ id: z.coerce.number().int() }),
      body: UpdateMikrotikSchema,
      response: {
        200: MikrotikSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const { id } = request.params;
        const body = request.body;
        const result = await new UpdateMikrotik().execute({
          id,
          ...(body.nome !== undefined ? { nome: body.nome } : {}),
          ...(body.ip !== undefined ? { ip: body.ip } : {}),
          ...(body.usuario !== undefined ? { usuario: body.usuario } : {}),
          ...(body.senha !== undefined ? { senha: body.senha } : {}),
          ...(body.porta !== undefined ? { porta: body.porta } : {}),
          ...('end_hotspot' in body ? { end_hotspot: body.end_hotspot } : {}),
        });
        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);
        if (error instanceof NotFoundError) {
          return reply.status(404).send({ error: error.message, code: error.code });
        }
        return reply.status(500).send({ error: 'Erro interno', code: 'INTERNAL_SERVER_ERROR' });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'DELETE',
    url: '/:id',
    schema: {
      tags: ['Mikrotiks'],
      summary: 'Deletar mikrotik',
      params: z.object({ id: z.coerce.number().int() }),
      response: {
        204: z.null(),
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        await new DeleteMikrotik().execute(request.params.id);
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
