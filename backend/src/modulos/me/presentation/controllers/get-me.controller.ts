import type { FastifyReply, FastifyRequest } from "fastify";

import { GetMe } from "../../usecases/GetMe.js";

export const getMeController = async (
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> => {
  try {
    const useCase = new GetMe();
    const result = useCase.execute({ payload: request.jwtPayload! });
    await reply.status(200).send(result);
  } catch (error) {
    reply.log.error(error);
    await reply.status(500).send({
      error: "Erro interno no servidor",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};
