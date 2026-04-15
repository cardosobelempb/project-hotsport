import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { ConflictError } from "@/core/domain/errors/usecases/conflict.error";
import { CreateLgpdConsentUserCase } from "@/modulos/lgpd-consent/application/usecases/create-lgpd-consent.usecase";
import {
  CreateLgpdConsentResponseSchema,
  LgpdConsentBaseSchema,
} from "../schemas/lgpd-consent.schema";

export const createLgpdConsentController = (
  createLgpdConsentUseCase: CreateLgpdConsentUserCase,
) => {
  return async (app: FastifyInstance): Promise<void> => {
    app.withTypeProvider<ZodTypeProvider>().route({
      method: "POST",
      url: "/",
      schema: {
        tags: ["Account"],
        summary: "Registrar um novo usuário",
        body: LgpdConsentBaseSchema,
        response: CreateLgpdConsentResponseSchema,
      },
      handler: async (request, reply) => {
        const result = await createLgpdConsentUseCase.execute(request.body);

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
        return reply.status(201).send(result.value.lgpdConsent);
      },
    });
  };
};
