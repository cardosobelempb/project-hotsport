import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { RegisterLgpdSchema } from "../../schemas/index.js";
import { RegisterLgpdConsent } from "../../usecases/LgpdUseCases.js";

type Body = z.infer<typeof RegisterLgpdSchema>;

export const registerLgpdConsentController = async (
  request: FastifyRequest<{ Body: Body }>,
  reply: FastifyReply,
): Promise<void> => {
  try {
    const body = request.body;
    const result = await new RegisterLgpdConsent().execute({
      cpf: body.cpf,
      consent: body.consent,
      ...(body.mac !== undefined ? { mac: body.mac } : {}),
      ...(body.ip !== undefined ? { ip: body.ip } : {}),
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.phone !== undefined ? { phone: body.phone } : {}),
    });
    await reply.status(201).send(result);
  } catch (error) {
    reply.log.error(error);
    await reply
      .status(500)
      .send({ error: "Erro interno", code: "INTERNAL_SERVER_ERROR" });
  }
};
