import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { SaveEfiConfigSchema } from '../../schemas/index.js';
import { SaveEfiConfig } from '../../usecases/EfiUseCases.js';

type Body = z.infer<typeof SaveEfiConfigSchema>;

export const saveEfiConfigController = async (
  request: FastifyRequest<{ Body: Body }>,
  reply: FastifyReply,
): Promise<void> => {
  try {
    const body = request.body;
    const result = await new SaveEfiConfig().execute({
      clientId: body.clientId,
      clientSecret: body.clientSecret,
      pixKey: body.pixKey,
      environment: body.environment,
      ...(body.certificateName !== undefined
        ? { certificateName: body.certificateName }
        : {}),
    });

    await reply.status(200).send(result);
  } catch (error) {
    reply.log.error(error);
    await reply
      .status(500)
      .send({ error: 'Erro interno', code: 'INTERNAL_SERVER_ERROR' });
  }
};
