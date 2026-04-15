import type { FastifyReply, FastifyRequest } from "fastify";

export const efiWebhookController = async (
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> => {
  reply.log.info({ webhook: request.body }, "EFI webhook received");
  await reply.status(200).send({ received: true });
};
