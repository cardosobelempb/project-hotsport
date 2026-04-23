import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { AlreadyExistsError } from "@/core/domain/errors/usecases/already-exists.error";

import { OrganizationCreateUseCase } from "@/modulos/organization/application/usecases/organization-create.usecase";
import { organizationCreateSchema } from "../schemas/organization-create.shema";
import { OrganizationPresentSchema } from "../schemas/organization-present.shema";

export const organizationCreateController = (
  organizationCreateUseCase: OrganizationCreateUseCase,
) => {
  return async (app: FastifyInstance): Promise<void> => {
    app.withTypeProvider<ZodTypeProvider>().route({
      method: "POST",
      url: "/organizations",
      schema: {
        tags: ["Organization"],
        summary: "Cria uma nova organização",
        body: organizationCreateSchema,
        response: OrganizationPresentSchema,
      },
      handler: async (request, reply) => {
        const result = await organizationCreateUseCase.execute(request.body);

        if (result.isLeft()) {
          const error = result.value;

          switch (error.constructor) {
            case AlreadyExistsError:
              return reply.status(409).send({
                message: error.message,
                statusCode: 409,
                timestamp: new Date().toISOString(),
                path: request.url,
                fieldName: error.path?.includes("slug") ? "slug" : "name",
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

        return reply.status(201).send(result.value.organization);
      },
    });
  };
};
