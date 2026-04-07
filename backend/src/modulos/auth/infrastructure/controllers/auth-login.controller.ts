import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { ConflictError, right } from "@/core";
import { env } from "@/core/infrastructure/env";
import { ErrorSchema, ValidationErrorSchema } from "@/shared/schemas/error";
import { AuthLoginUseCase } from "../../application/usecases/AuthLoginUseCase";
import {
  AuthLoginBodySchema,
  AuthLoginPresentSchema,
} from "../schemas/auth.login.schema";

export const authLoginController = (authLoginUseCase: AuthLoginUseCase) => {
  return async (app: FastifyInstance): Promise<void> => {
    app.withTypeProvider<ZodTypeProvider>().route({
      method: "POST",
      url: "/",
      schema: {
        tags: ["Auth"],
        summary: "Login a user",
        body: AuthLoginBodySchema,
        response: {
          201: AuthLoginPresentSchema,
          409: ErrorSchema,
          422: ValidationErrorSchema,
          500: ErrorSchema,
        },
      },
      handler: async (request, reply) => {
        const result = await authLoginUseCase.execute(request.body);

        if (result.isLeft()) {
          const error = result.value;

          switch (error.constructor) {
            case ConflictError:
              return reply.status(409).send({
                message: error.message,
                statusCode: 409,
                timestamp: new Date().toISOString(),
                path: request.url,
                fieldName: error.path?.includes("email") ? "email" : "cpf",
                error: error.error,
              });

            default:
              return reply.status(422).send({
                message: error.message,
                statusCode: 422,
                timestamp: new Date().toISOString(),
                path: request.url,
                error: error.error,
              });
          }
        }

        // ✅ Envia { user: {...}, accessToken: "..." }
        const { auth, user, accessToken, refreshToken } = result.value;

        reply.cookie("access_token", accessToken, {
          httpOnly: true,
          secure: env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 24 * 60 * 60 * 1000, // 1 dias
        });

        reply.cookie("refresh_token", refreshToken, {
          httpOnly: true,
          secure: env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
        });

        return right({ message: "Login successful" });
      },
    });
  };
};
