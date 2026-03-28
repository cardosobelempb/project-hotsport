import type { FastifyReply, FastifyRequest } from 'fastify';

import { AppError, NotFoundError } from '../../../errors/index.js';
import { GetPlan } from '../../application/usecases/get-plan.usecase.js';

interface Params {
  id: number;
}

export const getPlanController = async (
  request: FastifyRequest<{ Params: Params }>,
  reply: FastifyReply,
): Promise<void> => {
  try {
    const result = await new GetPlan().execute(request.params.id);
    await reply.status(200).send(result);
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
