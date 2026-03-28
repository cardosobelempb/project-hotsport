import type { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { ErrorSchema, PlanoSchema } from '../../../schemas/index.js';
import { getPlanController } from '../controllers/get-plan.controller.js';
import { getPlansController } from '../controllers/get-plans.controller.js';

export const planPublicRouter = async (app: FastifyInstance): Promise<void> => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/',
    schema: {
      tags: ['Public Plans'],
      summary: 'List available plans for customers (no authentication)',
      response: {
        200: z.array(PlanoSchema),
        500: ErrorSchema,
      },
    },
    handler: getPlansController,
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/:id',
    schema: {
      tags: ['Public Plans'],
      summary: 'Get public plan by ID',
      params: z.object({ id: z.coerce.number().int() }),
      response: {
        200: PlanoSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: getPlanController,
  });
};
