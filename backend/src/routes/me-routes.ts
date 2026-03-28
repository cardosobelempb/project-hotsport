import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { JwtMeOutputSchema } from "@/schemas/auth.js";

import { requireAuth } from "../modulos/auth/jwt.js";
import { ErrorSchema } from "../schemas/error.js";
import { GetMe } from "../usecases/GetMe.js";

export const meRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/me",
    preHandler: requireAuth,
    schema: {
      tags: ["Auth"],
      summary: "Retorna dados do payload do token JWT",
      response: {
        200: JwtMeOutputSchema,
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const useCase = new GetMe();
        const result = useCase.execute({ payload: request.jwtPayload! });
        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({
          error: "Erro interno no servidor",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });
};
