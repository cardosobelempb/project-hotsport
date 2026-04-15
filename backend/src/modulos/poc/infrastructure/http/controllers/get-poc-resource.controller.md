import { fromNodeHeaders } from "better-auth/node";
import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { UnauthorizedError } from "../../errors/index.js";
import { auth } from "../../lib/auth.js";
import { ParamsIdSchema } from "../../schemas/index.js";
import { GetPocResource } from "../../usecases/GetPocResource.js";

type Params = z.infer<typeof ParamsIdSchema>;

export const getPocResourceController = async (
  request: FastifyRequest<{ Params: Params }>,
  reply: FastifyReply,
): Promise<void> => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(request.headers),
  });

  if (!session) {
    throw new UnauthorizedError();
  }

  const useCase = new GetPocResource();
  const result = await useCase.execute({ id: request.params.id });
  await reply.status(200).send(result);
};
