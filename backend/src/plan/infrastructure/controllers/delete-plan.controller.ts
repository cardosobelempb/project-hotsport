import type { FastifyReply, FastifyRequest } from 'fastify';

import { AppError, NotFoundError } from '../../../errors/index.js';
import { DeletePlan } from '../../application/usecases/delete-plan.usecase.js';

interface Params {
  id: number;
}

export const deletePlanController = async (
  request: FastifyRequest<{ Params: Params }>,
  reply: FastifyReply,
): Promise<void> => {
  try {
    await new DeletePlan().execute(request.params.id);
    await reply.status(204).send(null);
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
