import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { AuthSessionUseCase } from "@/modulos/auth/application/usecases/auth-session.use-case";

export const authSessionController = (
  authSessionUseCase: AuthSessionUseCase,
) => {
  return async (app: FastifyInstance): Promise<void> => {
    app.withTypeProvider<ZodTypeProvider>().route({
      method: "GET",
      url: "/",
      schema: {
        tags: ["Auth"],
        summary: "Authenticate a user",
        // response: AuthSessionResponseSchema,
      },
      handler: async (request, reply) => {
        // const result = await authSessionUseCase.execute({
        //   accessToken: request.cookies["access_token"] ?? "",
        // });
        // if (result.isLeft()) {
        //   const error = result.value;
        //   return reply.status(401).send({
        //     message: error.message,
        //     statusCode: 401,
        //     timestamp: new Date().toISOString(),
        //   });
        // }
        // return reply.send({ user: result.value.user });
      },
    });
  };
};
