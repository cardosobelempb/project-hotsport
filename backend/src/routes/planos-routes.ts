import { fromNodeHeaders } from 'better-auth/node';
import { type FastifyInstance } from 'fastify';
import { type ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { auth } from '../lib/auth.js';
import { ErrorSchema, MessageSchema, PlanoCreateSchema, PlanoSchema } from '../schemas/index.js';
import { createPlanController } from '../plan/infrastructure/controllers/create-plan.controller.js';
import { deletePlanController } from '../plan/infrastructure/controllers/delete-plan.controller.js';
import { getPlanController } from '../plan/infrastructure/controllers/get-plan.controller.js';
import { getPlansController } from '../plan/infrastructure/controllers/get-plans.controller.js';
import { updatePlanController } from '../plan/infrastructure/controllers/update-plan.controller.js';

export const planosRoutes = async (app: FastifyInstance): Promise<void> => {
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
      summary: 'List all internet plans',
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
      summary: 'Create a new internet plan',
      body: PlanoCreateSchema,
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
      summary: 'Update an internet plan',
      params: z.object({ id: z.coerce.number().int() }),
      body: PlanoCreateSchema,
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
      summary: 'Remove an internet plan',
      params: z.object({ id: z.coerce.number().int() }),
      response: {
        200: MessageSchema,
        401: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: deletePlanController,
  });
};
