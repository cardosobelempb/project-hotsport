import type { FastifyReply, FastifyRequest } from 'fastify';

import { AppError, NotFoundError } from '../../../errors/index.js';
import type { UpdatePlanInputDto } from '../../application/usecases/update-plan.usecase.js';
import { UpdatePlan } from '../../application/usecases/update-plan.usecase.js';

interface Params {
  id: number;
}

type Body = Omit<UpdatePlanInputDto, 'id'>;

export const updatePlanController = async (
  request: FastifyRequest<{ Params: Params; Body: Body }>,
  reply: FastifyReply,
): Promise<void> => {
  try {
    const result = await new UpdatePlan().execute({ id: request.params.id, ...request.body });
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
