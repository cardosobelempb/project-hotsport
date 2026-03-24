import type { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { NotFoundError } from '../errors/index.js';
import {
  CreatePlanoSchema,
  ErrorSchema,
  PlanoSchema,
  UpdatePlanoSchema,
} from '../schemas/index.js';
import { CreatePlan, DeletePlan,GetPlans, UpdatePlan } from '../usecases/PlanUseCases.js';

export const planRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/',
    schema: {
      tags: ['Planos'],
      summary: 'Listar todos os planos',
      response: {
        200: z.array(PlanoSchema),
        500: ErrorSchema,
      },
    },
    handler: async (_request, reply) => {
      try {
        const result = await new GetPlans().execute();
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
      tags: ['Planos'],
      summary: 'Criar plano',
      body: CreatePlanoSchema,
      response: {
        201: PlanoSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const result = await new CreatePlan().execute(request.body);
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
      tags: ['Planos'],
      summary: 'Atualizar plano',
      params: z.object({ id: z.coerce.number().int() }),
      body: UpdatePlanoSchema,
      response: {
        200: PlanoSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const { id } = request.params;
        const body = request.body;
        const result = await new UpdatePlan().execute({
          id,
          ...(body.nome !== undefined ? { nome: body.nome } : {}),
          ...('descricao' in body ? { descricao: body.descricao } : {}),
          ...(body.valor !== undefined ? { valor: body.valor } : {}),
          ...(body.duracao_minutos !== undefined ? { duracao_minutos: body.duracao_minutos } : {}),
          ...(body.velocidade_down !== undefined ? { velocidade_down: body.velocidade_down } : {}),
          ...(body.velocidade_up !== undefined ? { velocidade_up: body.velocidade_up } : {}),
          ...(body.mikrotik_id !== undefined ? { mikrotik_id: body.mikrotik_id } : {}),
          ...(body.ativo !== undefined ? { ativo: body.ativo } : {}),
          ...(body.address_pool !== undefined ? { address_pool: body.address_pool } : {}),
          ...(body.shared_users !== undefined ? { shared_users: body.shared_users } : {}),
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
      tags: ['Planos'],
      summary: 'Deletar plano',
      params: z.object({ id: z.coerce.number().int() }),
      response: {
        204: z.null(),
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        await new DeletePlan().execute({ id: request.params.id });
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
