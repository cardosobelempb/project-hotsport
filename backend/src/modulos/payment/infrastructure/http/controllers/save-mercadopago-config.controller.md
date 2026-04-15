import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { SaveMercadoPagoConfigSchema } from "../../schemas/index.js";
import { SaveMercadoPagoConfig } from "../../usecases/MercadoPagoUseCases.js";

type Body = z.infer<typeof SaveMercadoPagoConfigSchema>;

export const saveMercadoPagoConfigController = async (
  request: FastifyRequest<{ Body: Body }>,
  reply: FastifyReply,
): Promise<void> => {
  try {
    const body = request.body;
    const result = await new SaveMercadoPagoConfig().execute({
      ...("publicKey" in body ? { publicKey: body.publicKey ?? null } : {}),
      ...("accessToken" in body
        ? { accessToken: body.accessToken ?? null }
        : {}),
      ...("clientId" in body ? { clientId: body.clientId ?? null } : {}),
      ...("clientSecret" in body
        ? { clientSecret: body.clientSecret ?? null }
        : {}),
      ...("webhookSecret" in body
        ? { webhookSecret: body.webhookSecret ?? null }
        : {}),
    });
    await reply.status(200).send(result);
  } catch (error) {
    reply.log.error(error);
    await reply
      .status(500)
      .send({ error: "Erro interno", code: "INTERNAL_SERVER_ERROR" });
  }
};
