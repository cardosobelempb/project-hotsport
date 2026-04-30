import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { CreateRadiusUserSchema } from '../../schemas/index.js';
import { CreateRadiusUser } from '../../usecases/RadiusUseCases.js';

type Body = z.infer<typeof CreateRadiusUserSchema>;

export const createRadiusUserController = async (
  request: FastifyRequest<{ Body: Body }>,
  reply: FastifyReply,
): Promise<void> => {
  try {
    const body = request.body;
    const result = await new CreateRadiusUser().execute({
      username: body.username,
      password: body.password,
      planId: body.planId ?? null,
      nasId: body.nasId ?? null,
    });
    await reply.status(201).send(result);
  } catch (error) {
    reply.log.error(error);
    await reply
      .status(500)
      .send({ error: 'Erro interno', code: 'INTERNAL_SERVER_ERROR' });
  }
};
