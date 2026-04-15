import type { FastifyReply, FastifyRequest } from "fastify";

export const getWhatsappStatusController = async (
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> => {
  try {
    // const session = await auth.api.getSession({
    //   headers: fromNodeHeaders(request.headers),
    // });

    const session = null; // TODO: Implementar autenticação

    if (!session) {
      await reply
        .status(401)
        .send({ error: "Unauthorized", code: "UNAUTHORIZED" });
      return;
    }

    await reply.status(200).send({ status: "disconnected" });
  } catch (error) {
    reply.log.error(error);
    await reply
      .status(500)
      .send({ error: "Internal server error", code: "INTERNAL_SERVER_ERROR" });
  }
};
