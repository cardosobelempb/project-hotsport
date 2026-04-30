import dayjs from "dayjs";
import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { PaymentSchema } from "../schemas/index.js";

type PaymentBody = z.infer<ReturnType<typeof PaymentSchema.omit>>;

export const createPaymentController = async (
  request: FastifyRequest<{ Body: PaymentBody }>,
  reply: FastifyReply,
): Promise<void> => {
  try {
    const data = request.body;
    await reply.status(201).send({
      id: 0,
      createdAt: dayjs().toISOString(),
      ...data,
    });
  } catch (error) {
    reply.log.error(error);
    await reply.status(500).send({
      error: "Erro interno no servidor",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
};
