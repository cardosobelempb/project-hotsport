import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { UnauthorizedError } from "@/common/domain/errors/usecases/unauthorized.error";
import { env } from "@/common/infrastructure/env";
import { SigninUseCase } from "@/modulos/identity/application/usecases/users/signin.usecase";
import {
  SigninBodySchema,
  SigninSummarySchema,
} from "../../../../../auth/infrastructure/http/schemas/signin.schema";

export const signinController = (signinUseCase: SigninUseCase) => {
  return async (app: FastifyInstance): Promise<void> => {
    app.withTypeProvider<ZodTypeProvider>().route({
      method: "POST",
      url: "/",
      schema: {
        tags: ["Auth"],
        summary: "Login a user",
        body: SigninBodySchema,
        response: SigninSummarySchema,
      },
      handler: async (request, reply) => {
        const result = await signinUseCase.execute(request.body);

        if (result.isLeft()) {
          const error = result.value;

          switch (error.constructor) {
            case UnauthorizedError:
              return reply.status(401).send({
                message: error.message,
                statusCode: 401,
                timestamp: new Date().toISOString(),
                path: request.url,
                error: error.error,
              });

            default:
              return reply.status(500).send({
                message: error.message,
                statusCode: 500,
                timestamp: new Date().toISOString(),
                path: request.url,
                error: error.error,
              });
          }
        }

        const { accessToken, refreshToken } = result.value;

        console.log("Access Token:", accessToken);
        console.log("Refresh Token:", refreshToken);
        console.log("Environment:", env.NODE_ENV);

        reply.cookie("access_token", accessToken, {
          httpOnly: true,
          secure: env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 24 * 60 * 60 * 1000, // 1 dia
        });

        reply.cookie("refresh_token", refreshToken, {
          httpOnly: true,
          secure: env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
        });

        return reply.status(200).send({ accessToken, refreshToken });
      },
    });
  };
};
