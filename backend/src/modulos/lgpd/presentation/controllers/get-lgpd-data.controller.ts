import type { FastifyReply, FastifyRequest } from "fastify";

import { GetLgpdData } from "../../usecases/LgpdUseCases.js";

export const getLgpdDataController = async (
  _request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> => {
  try {
    const result = await new GetLgpdData().execute();
    await reply.status(200).send(result);
  } catch (error) {
    reply.log.error(error);
    await reply
      .status(500)
      .send({ error: "Erro interno", code: "INTERNAL_SERVER_ERROR" });
  }
};
