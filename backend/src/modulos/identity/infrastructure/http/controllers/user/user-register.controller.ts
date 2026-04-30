import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { AlreadyExistsError } from "@/common/domain/errors/usecases/already-exists.error";
import { CreateUserUseCase } from "@/modulos/identity/application/usecases/users/create-user.usecase";
import { createUserSchema } from "../../schemas/user.schema";

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
        body: createUserSchema,
        // response: userPresenterSchema,
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

        return reply.status(201).send({
          user: result.value.user,
        });
      },
    });
  };
};
