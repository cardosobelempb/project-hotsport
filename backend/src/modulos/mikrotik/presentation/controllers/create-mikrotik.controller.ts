import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { CreateMikrotikSchema } from "../../schemas/index.js";
import { CreateMikrotik } from "../../usecases/MikrotikUseCases.js";

type Body = z.infer<typeof CreateMikrotikSchema>;

export const createMikrotikController = async (
  request: FastifyRequest<{ Body: Body }>,
  reply: FastifyReply,
): Promise<void> => {
  try {
    const result = await new CreateMikrotik().execute(request.body);
    await reply.status(201).send(result);
  } catch (error) {
    reply.log.error(error);
    await reply
      .status(500)
      .send({ error: "Erro interno", code: "INTERNAL_SERVER_ERROR" });
  }
};
