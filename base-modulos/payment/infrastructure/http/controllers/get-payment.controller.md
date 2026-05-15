import type { FastifyReply, FastifyRequest } from "fastify";

import { GetPayments } from "../../usecases/PaymentUseCases.js";

export const getPaymentsController = async (
  _request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> => {
  try {
    const result = await new GetPayments().execute();
    await reply.status(200).send(result);
  } catch (error) {
    reply.log.error(error);
    await reply
      .status(500)
      .send({ error: "Erro interno", code: "INTERNAL_SERVER_ERROR" });
  }
};
