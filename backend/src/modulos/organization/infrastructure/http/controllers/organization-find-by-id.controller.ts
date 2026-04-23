import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { NotFoundError } from "@/core/domain/errors/usecases/not-founde.rror";
import { OrganizationFindByIdUseCase } from "@/modulos/organization/application/usecases/organization-find-by-id.usecase";
import { OrganizationPresentSchema } from "../schemas/organization-present.shema";

const OrganizationParamsSchema = z.object({
  organizationId: z.string().uuid(),
});

export const organizationFindByIdController = (
  organizationFindByIdUseCase: OrganizationFindByIdUseCase,
) => {
  return async (app: FastifyInstance): Promise<void> => {
    app.withTypeProvider<ZodTypeProvider>().route({
      method: "GET",
      url: "/organizations/:organizationId",
      schema: {
        tags: ["Organization"],
        summary: "Busca uma organização por ID",
        params: OrganizationParamsSchema,
        response: OrganizationPresentSchema,
      },
      handler: async (request, reply) => {
        const result = await organizationFindByIdUseCase.execute({
          organizationId: request.params.organizationId,
        });

        if (result.isLeft()) {
          const error = result.value;

          switch (error.constructor) {
            case NotFoundError:
              return reply.status(404).send({
                message: error.message,
                statusCode: 404,
                timestamp: new Date().toISOString(),
                path: request.url,
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

        return reply.status(200).send(result.value.organization);
      },
    });
  };
};
