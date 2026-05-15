import { CreateAccountUseCase } from "@/modules/identity/application/usecases/create-account.usecase";
import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  AccountSummarySchema,
  CreateAccountSchema,
} from "../schemas/account.schema";

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
        response: AccountSummarySchema,
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
