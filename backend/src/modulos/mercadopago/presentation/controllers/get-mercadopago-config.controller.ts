import type { FastifyReply, FastifyRequest } from "fastify";

import { GetMercadoPagoConfig } from "../../usecases/MercadoPagoUseCases.js";

export const getMercadoPagoConfigController = async (
  _request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> => {
  try {
    const result = await new GetMercadoPagoConfig().execute();
    await reply.status(200).send(result);
  } catch (error) {
    reply.log.error(error);
    await reply
      .status(500)
      .send({ error: "Erro interno", code: "INTERNAL_SERVER_ERROR" });
  }
};
