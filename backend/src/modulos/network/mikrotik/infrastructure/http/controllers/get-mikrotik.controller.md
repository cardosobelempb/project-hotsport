import { NotFoundError } from "@/core/domain/errors/usecases/not-founde.rror";
import { GetMikrotik } from "@/modulos/mikrotik/application/usecases/get-mikrotik.use-case";
import type { FastifyReply, FastifyRequest } from "fastify";

interface Params {
  id: number;
}

export const getMikrotikController = async (
  request: FastifyRequest<{ Params: Params }>,
  reply: FastifyReply,
): Promise<void> => {
  try {
    const result = await new GetMikrotik().execute(request.params.id);
    await reply.status(200).send(result);
  } catch (error) {
    reply.log.error(error);
    if (error instanceof NotFoundError) {
      await reply
        .status(404)
        .send({ error: error.message, code: error.statusCode });
      return;
    }

    await reply
      .status(500)
      .send({ error: "Erro interno", code: "INTERNAL_SERVER_ERROR" });
  }
};
