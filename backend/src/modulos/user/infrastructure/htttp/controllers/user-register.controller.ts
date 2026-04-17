import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { ErrorSchema, ValidationErrorSchema } from "@/shared/schemas/error";

import { AlreadyExistsError } from "@/core/domain/errors/usecases/already-exists.error";

import { CreateUserUseCase } from "@/modulos/user/application/usecases/create-user.usecase";
import { UserCreateBodySchema } from "../schemas/user-create.schema";
import { UserPresentSchema } from "../schemas/user-register.schema";

export const userRegisterController = (
  createUserUseCase: CreateUserUseCase,
) => {
  return async (app: FastifyInstance): Promise<void> => {
    app.withTypeProvider<ZodTypeProvider>().route({
      method: "POST",
      url: "/register",
      schema: {
        tags: ["Register User"],
        summary: "Registra um novo usuário",
        body: UserCreateBodySchema,
        response: {
          201: UserPresentSchema,
          409: ErrorSchema,
          422: ValidationErrorSchema,
          500: ErrorSchema,
        },
      },
      handler: async (request, reply) => {
        const result = await createUserUseCase.execute(request.body);

        if (result.isLeft()) {
          const error = result.value;

          switch (error.constructor) {
            case AlreadyExistsError:
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

        return reply.status(201).send(result.value.user);
      },
    });
  };
};
