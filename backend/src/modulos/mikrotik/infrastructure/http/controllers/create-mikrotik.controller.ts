import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { AlreadyExistsError } from "@/common/domain/errors/usecases/already-exists.error";
import { CreateMikrotikUseCase } from "@/modulos/mikrotik/application/usecases/create-mikrotik.use-case";
import {
  CreateMikrotikMikrotikSchema,
  CreateMikrotikResponseSchema,
} from "../schemas/mikrotik.schema";

export const mikrotikRegisterController = (
  createMikrotikUseCase: CreateMikrotikUseCase,
) => {
  return async (app: FastifyInstance): Promise<void> => {
    app.withTypeProvider<ZodTypeProvider>().route({
      method: "POST",
      url: "/",
      schema: {
        tags: ["Create Mikrotik"],
        summary: "Cria um novo Mikrotik",
        body: CreateMikrotikMikrotikSchema,
        response: CreateMikrotikResponseSchema,
      },
      handler: async (request, reply) => {
        const result = await createMikrotikUseCase.execute(request.body);

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

        return reply.status(201).send(result.value.mikrotik);
      },
    });
  };
};
