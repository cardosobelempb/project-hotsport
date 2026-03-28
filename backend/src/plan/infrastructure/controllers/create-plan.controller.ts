import type { FastifyReply, FastifyRequest } from 'fastify';

import { AppError, NotFoundError } from '../../../errors/index.js';
import type { CreatePlanInputDto } from '../../application/usecases/create-plan.usecase.js';
import { CreatePlan } from '../../application/usecases/create-plan.usecase.js';

export const createPlanController = async (
  request: FastifyRequest<{ Body: CreatePlanInputDto }>,
  reply: FastifyReply,
): Promise<void> => {
  try {
    const result = await new CreatePlan().execute(request.body);
    await reply.status(201).send(result);
  } catch (error) {
    reply.log.error(error);
    if (error instanceof NotFoundError) {
      await reply.status(404).send({ error: error.message, code: error.code });
      return;
    }
    if (error instanceof AppError) {
      await reply.status(error.statusCode).send({ error: error.message, code: error.code });
      return;
    }
    await reply.status(500).send({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
  }
};
