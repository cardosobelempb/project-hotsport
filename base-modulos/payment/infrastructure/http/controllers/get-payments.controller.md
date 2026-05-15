import type { FastifyReply, FastifyRequest } from "fastify";

export const getPaymentsController = async (
  _request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> => {
  try {
    await reply.status(200).send([]);
  } catch (error) {
    reply.log.error(error);
    await reply.status(500).send({
      error: "Erro interno no servidor",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};
