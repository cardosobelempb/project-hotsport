import { fromNodeHeaders } from "better-auth/node";
import type { FastifyReply, FastifyRequest } from "fastify";

import { auth } from "../../lib/auth.js";

export const connectWhatsappController = async (
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    });

    if (!session) {
      await reply
        .status(401)
        .send({ error: "Unauthorized", code: "UNAUTHORIZED" });
      return;
    }

    await reply.status(200).send({
      status: "connecting",
      message: "Iniciando conexão com WhatsApp",
    });
  } catch (error) {
    reply.log.error(error);
    await reply
      .status(500)
      .send({ error: "Internal server error", code: "INTERNAL_SERVER_ERROR" });
  }
};
