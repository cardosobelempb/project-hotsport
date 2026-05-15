import { fromNodeHeaders } from "better-auth/node";
import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { NotFoundError } from "../../errors/index.js";
import { auth } from "../../lib/auth.js";

const ParamsSchema = z.object({ id: z.coerce.number().int() });

type Params = z.infer<typeof ParamsSchema>;

export const deletePaymentAuthController = async (
  request: FastifyRequest<{ Params: Params }>,
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

    void request.params.id;
    await reply.status(200).send({ message: "Payment removido com sucesso" });
  } catch (error) {
    reply.log.error(error);
    if (error instanceof NotFoundError) {
      await reply.status(404).send({ error: error.message, code: error.code });
      return;
    }

    await reply
      .status(500)
      .send({ error: "Internal server error", code: "INTERNAL_SERVER_ERROR" });
  }
};
