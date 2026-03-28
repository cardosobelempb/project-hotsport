import { fromNodeHeaders } from 'better-auth/node';
import type { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { auth } from '../../../lib/auth.js';
import {
  CreatePlanoSchema,
  ErrorSchema,
  PlanoSchema,
  UpdatePlanoSchema,
} from '../../../schemas/index.js';
import {
  createPlanController,
  deletePlanController,
  getPlanController,
  getPlansController,
  updatePlanController,
} from '../controllers/index.js';

export const planRouter = async (app: FastifyInstance): Promise<void> => {
  app.addHook('preHandler', async (request, reply) => {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
    if (!session) {
      return reply.status(401).send({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
    }
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/',
    schema: {
      tags: ['Plans'],
      summary: 'List all plans',
      response: {
        200: z.array(PlanoSchema),
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: getPlansController,
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/:id',
    schema: {
      tags: ['Plans'],
      summary: 'Get plan by ID',
      params: z.object({ id: z.coerce.number().int() }),
      response: {
        200: PlanoSchema,
        401: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: getPlanController,
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/',
    schema: {
      tags: ['Plans'],
      summary: 'Create a new plan',
      body: CreatePlanoSchema,
      response: {
        201: PlanoSchema,
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: createPlanController,
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'PUT',
    url: '/:id',
    schema: {
      tags: ['Plans'],
      summary: 'Update a plan',
      params: z.object({ id: z.coerce.number().int() }),
      body: UpdatePlanoSchema,
      response: {
        200: PlanoSchema,
        401: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: updatePlanController,
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'DELETE',
    url: '/:id',
    schema: {
      tags: ['Plans'],
      summary: 'Delete a plan',
      params: z.object({ id: z.coerce.number().int() }),
      response: {
        204: z.null(),
        401: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: deletePlanController,
  });
};
