import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { CreatePaymentSchema } from "../../schemas/index.js";
import { ProcessPayment } from "../../usecases/PaymentUseCases.js";

type Body = z.infer<typeof CreatePaymentSchema>;

export const createPaymentController = async (
  request: FastifyRequest<{ Body: Body }>,
  reply: FastifyReply,
): Promise<void> => {
  try {
    const result = await new ProcessPayment().execute(request.body);
    await reply.status(201).send(result);
  } catch (error) {
    reply.log.error(error);
    await reply
      .status(500)
      .send({ error: "Erro interno", code: "INTERNAL_SERVER_ERROR" });
  }
};
