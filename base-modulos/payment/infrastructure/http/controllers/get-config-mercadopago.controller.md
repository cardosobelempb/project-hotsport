import { fromNodeHeaders } from "better-auth/node";
import type { FastifyReply, FastifyRequest } from "fastify";

import { auth } from "../../lib/auth.js";

export const getConfigMercadoPagoController = async (
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
      id: 1,
      publicKey: null,
      accessToken: null,
      clientId: null,
      clientSecret: null,
      webhookSecret: null,
    });
  } catch (error) {
    reply.log.error(error);
    await reply
      .status(500)
      .send({ error: "Internal server error", code: "INTERNAL_SERVER_ERROR" });
  }
};
