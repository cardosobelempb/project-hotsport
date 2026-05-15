import { NotFoundError } from "@/core/domain/errors/usecases/not-founde.rror";
import { DeleteMikrotik } from "@/modulos/mikrotik/application/usecases/delete-mikrotik.use-case";
import type { FastifyReply, FastifyRequest } from "fastify";

interface Params {
  id: number;
}

export const deleteMikrotikController = async (
  request: FastifyRequest<{ Params: Params }>,
  reply: FastifyReply,
): Promise<void> => {
  try {
    await new DeleteMikrotik().execute(request.params.id);
    await reply.status(204).send(null);
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
