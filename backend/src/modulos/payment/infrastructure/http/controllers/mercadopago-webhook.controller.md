import type { FastifyReply, FastifyRequest } from "fastify";

export const mercadoPagoWebhookController = async (
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> => {
  reply.log.info({ webhook: request.body }, "MercadoPago webhook received");
  await reply.status(200).send({ received: true });
};
