import {
  AccountCreateResponseSchema,
  CreateAccountSchema,
} from "@/modulos/identity/application/schemas/account.shema";
import { CreateAccountUseCase } from "@/modulos/identity/application/usecases/account/create-account.use-case";
import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

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
        body: CreateAccountSchema,
        response: AccountCreateResponseSchema,
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
