import { fromNodeHeaders } from 'better-auth/node';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { auth } from '../../lib/auth.js';

const UpdateConfigMercadoPagoSchema = z.object({
  publicKey: z.string().nullable().optional(),
  accessToken: z.string().nullable().optional(),
  clientId: z.string().nullable().optional(),
  clientSecret: z.string().nullable().optional(),
  webhookSecret: z.string().nullable().optional(),
});

type Body = z.infer<typeof UpdateConfigMercadoPagoSchema>;

export const updateConfigMercadoPagoController = async (
  request: FastifyRequest<{ Body: Body }>,
  reply: FastifyReply,
): Promise<void> => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    });

    if (!session) {
      await reply.status(401).send({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
      return;
    }

    await reply.status(200).send({
      id: 1,
      publicKey: request.body.publicKey ?? null,
      accessToken: request.body.accessToken ?? null,
      clientId: request.body.clientId ?? null,
      clientSecret: request.body.clientSecret ?? null,
      webhookSecret: request.body.webhookSecret ?? null,
    });
  } catch (error) {
    reply.log.error(error);
    await reply
      .status(500)
      .send({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
  }
};
