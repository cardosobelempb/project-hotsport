import type { FastifyReply, FastifyRequest } from 'fastify';
import { type z } from 'zod';

import { UnauthorizedError } from '../../errors/index.js';
import { LoginSchema } from '../../schemas/index.js';
import { AuthenticateAdmin } from '../../usecases/AuthenticateAdmin.js';

type LoginBody = z.infer<typeof LoginSchema>;

export const adminLoginController = async (
  request: FastifyRequest<{ Body: LoginBody }>,
  reply: FastifyReply,
): Promise<void> => {
  try {
    const useCase = new AuthenticateAdmin();
    const result = await useCase.execute(request.body);
    await reply.status(200).send(result);
  } catch (error) {
    request.log.error(error);
    if (error instanceof UnauthorizedError) {
      await reply.status(401).send({ error: error.message, code: error.code });
      return;
    }
    await reply.status(500).send({ error: 'Erro interno no servidor', code: 'INTERNAL_SERVER_ERROR' });
  }
};
