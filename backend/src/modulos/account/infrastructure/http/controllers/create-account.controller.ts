import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { ConflictError } from "@/common/domain/errors/usecases/conflict.error";
import { CreateAccountUseCase } from "../../../application/usecases/create-account.use-case";
import {
  CreateAccountBodySchema,
  CreateAccountResponseSchema,
} from "../schemas/create-account.schema";

export const createAccountController = (
  createAccountUseCase: CreateAccountUseCase,
) => {
  return async (app: FastifyInstance): Promise<void> => {
    app.withTypeProvider<ZodTypeProvider>().route({
      method: "POST",
      url: "/",
      schema: {
        tags: ["Account"],
        summary: "Registrar um novo usuário",
        body: CreateAccountBodySchema,
        response: CreateAccountResponseSchema,
      },
      handler: async (request, reply) => {
        const result = await createAccountUseCase.execute(request.body);
        // const logger = fromFastifyLogger(request.log);
        const logger = request.server.log; // logger global do Fastify
        logger.info({ path: request.url }, "Buscando usuários");

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

        console.log("Account registration successful:", {
          requestBody: request.body,
          responseData: result.value.user.email,
        });

        // ✅ Envia { user: {...}, accessToken: "..." }
        return reply.status(201).send(result.value.user);
      },
    });
  };
};
