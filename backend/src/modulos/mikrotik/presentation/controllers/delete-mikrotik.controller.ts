import type { FastifyReply, FastifyRequest } from "fastify";

import { NotFoundError } from "../../errors/index.js";
import { DeleteMikrotik } from "../../usecases/MikrotikUseCases.js";

interface Params {
  id: number;
}

export const deleteMikrotikController = async (
  request: FastifyRequest<{ Params: Params }>,
  reply: FastifyReply,
): Promise<void> => {
  try {
    await new DeleteMikrotik().execute(request.params.id);
    await reply.status(204).send(null);
  } catch (error) {
    reply.log.error(error);
    if (error instanceof NotFoundError) {
      await reply.status(404).send({ error: error.message, code: error.code });
      return;
    }

    await reply
      .status(500)
      .send({ error: "Erro interno", code: "INTERNAL_SERVER_ERROR" });
  }
};
