import type { FastifyReply, FastifyRequest } from "fastify";

import { NotFoundError } from "../../errors/index.js";
import { DeleteRadiusUser } from "../../usecases/RadiusUseCases.js";

interface Params {
  id: number;
}

export const deleteRadiusUserController = async (
  request: FastifyRequest<{ Params: Params }>,
  reply: FastifyReply,
): Promise<void> => {
  try {
    await new DeleteRadiusUser().execute({ id: request.params.id });
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
