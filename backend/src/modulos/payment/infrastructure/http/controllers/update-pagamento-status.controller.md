import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { NotFoundError } from "../../errors/index.js";
import { UpdatePaymentStatus } from "../../usecases/PaymentUseCases.js";

const UpdateStatusParamsSchema = z.object({ id: z.coerce.number().int() });
const UpdateStatusBodySchema = z.object({ status: z.string().min(1) });

type Params = z.infer<typeof UpdateStatusParamsSchema>;
type Body = z.infer<typeof UpdateStatusBodySchema>;

export const updatePaymentStatusController = async (
  request: FastifyRequest<{ Params: Params; Body: Body }>,
  reply: FastifyReply,
): Promise<void> => {
  try {
    const result = await new UpdatePaymentStatus().execute({
      id: request.params.id,
      status: request.body.status,
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
