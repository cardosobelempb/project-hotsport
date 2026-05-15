import { NotFoundError } from "@/core/domain/errors/usecases/not-founde.rror";
import { UpdateMikrotik } from "@/modulos/mikrotik/application/usecases/update-mikrotik.use-case";
import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

interface Params {
  id: number;
}

type Body = z.infer<typeof UpdateMikrotikSchema>;

export const updateMikrotikController = async (
  request: FastifyRequest<{ Params: Params; Body: Body }>,
  reply: FastifyReply,
): Promise<void> => {
  try {
    const { id } = request.params;
    const body = request.body;
    const result = await new UpdateMikrotik().execute({
      id,
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.ip !== undefined ? { ip: body.ip } : {}),
      ...(body.username !== undefined ? { username: body.username } : {}),
      ...(body.password !== undefined ? { password: body.password } : {}),
      ...(body.port !== undefined ? { port: body.port } : {}),
      ...("hotspotAddress" in body && body.hotspotAddress !== undefined
        ? { hotspotAddress: body.hotspotAddress }
        : {}),
    });
    await reply.status(200).send(result);
  } catch (error) {
    reply.log.error(error);
    if (error instanceof NotFoundError) {
      await reply.status(404).send({ error: error.message, code: error.code });
      return;
    }

    await reply
      .status(500)
      .send({ error: "Erro interno", code: "INTERNAL_SERVER_ERROR" });
  }
};
