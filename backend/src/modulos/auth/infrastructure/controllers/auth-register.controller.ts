import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { ConflictError } from "@/core";
import { ErrorSchema, ValidationErrorSchema } from "@/shared/schemas/error";
import { AuthRegisterUseCase } from "../../application/usecases/AuthRegisterUseCase";
import {
  AuthRegisterBodySchema,
  AuthRegisterPresentSchema,
} from "../schemas/auth-register.schema";

export const authRegisterController = (
  authRegisterUseCase: AuthRegisterUseCase,
) => {
  return async (app: FastifyInstance): Promise<void> => {
    app.withTypeProvider<ZodTypeProvider>().route({
      method: "POST",
      url: "/",
      schema: {
        tags: ["Auth"],
        summary: "Registrar um novo usuário",
        body: AuthRegisterBodySchema,
        response: {
          201: AuthRegisterPresentSchema,
          409: ErrorSchema,
          422: ValidationErrorSchema,
          500: ErrorSchema,
        },
      },
      handler: async (request, reply) => {
        const result = await authRegisterUseCase.execute(request.body);

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
        return reply.status(201).send({
          user: result.value.user.toJSON(),
        });
      },
    });
  };
};
