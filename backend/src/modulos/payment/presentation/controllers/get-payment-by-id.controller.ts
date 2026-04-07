import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { NotFoundError } from "../../errors/index.js";
import { ParamsIdSchema } from "../../schemas/index.js";

type Params = z.infer<typeof ParamsIdSchema>;

export const getPaymentByIdController = async (
  request: FastifyRequest<{ Params: Params }>,
  reply: FastifyReply,
): Promise<void> => {
  try {
    const { id } = request.params;
    void id;
    throw new NotFoundError("Payment não encontrado");
  } catch (error) {
    reply.log.error(error);
    if (error instanceof NotFoundError) {
      await reply.status(404).send({ error: error.message, code: error.code });
      return;
    }

    await reply.status(500).send({
      error: "Erro interno no servidor",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};
