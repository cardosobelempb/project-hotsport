import type { FastifyReply, FastifyRequest } from 'fastify';

import { AppError, NotFoundError } from '../../../errors/index.js';
import { GetPlans } from '../../application/usecases/get-plans.usecase.js';

export const getPlansController = async (
  _request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> => {
  try {
    const result = await new GetPlans().execute();
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
