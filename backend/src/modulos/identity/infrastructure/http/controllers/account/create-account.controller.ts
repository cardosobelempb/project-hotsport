import { CreateAccountUseCase } from "@/modulos/identity/application/usecases/account/create-account.use-case";
import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  CreateAccountBodySchema,
  CreateAccountResponseSchema,
} from "../../schemas/account/create-account.schema";

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

        if (result.isLeft()) {
          throw result.value;
        }

        return reply.status(201).send(result.value.user);
      },
    });
  };
};
