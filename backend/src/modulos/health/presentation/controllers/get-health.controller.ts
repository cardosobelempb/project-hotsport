import type { FastifyReply, FastifyRequest } from 'fastify';

export const getHealthController = async (
  _request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> => {
  await reply.status(200).send({ ok: true });
};
