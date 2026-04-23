import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { AlreadyExistsError } from "@/core/domain/errors/usecases/already-exists.error";
import { NotFoundError } from "@/core/domain/errors/usecases/not-founde.rror";
import { OrganizationUpdateUseCase } from "@/modulos/organization/application/usecases/organization-update.usecase";
import { OrganizationPresentSchema } from "../schemas/organization-present.shema";
import { OrganizationUpdateSchema } from "../schemas/organization-update.shema";
import { OrganizationParamsSchema } from "../schemas/organization.shema";

export const organizationUpdateController = (
  organizationUpdateUseCase: OrganizationUpdateUseCase,
) => {
  return async (app: FastifyInstance): Promise<void> => {
    app.withTypeProvider<ZodTypeProvider>().route({
      method: "PUT",
      url: "/organizations/:organizationId",
      schema: {
        tags: ["Organization"],
        summary: "Atualiza uma organização",
        params: OrganizationParamsSchema,
        body: OrganizationUpdateSchema,
        response: OrganizationPresentSchema,
      },
      handler: async (request, reply) => {
        const result = await organizationUpdateUseCase.execute(
          { organizationId: request.params.organizationId },
          request.body,
        );

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

            case AlreadyExistsError:
              return reply.status(409).send({
                message: error.message,
                statusCode: 409,
                timestamp: new Date().toISOString(),
                path: request.url,
                fieldName: error.path?.includes("slug")
                  ? "slug"
                  : error.path?.includes("name")
                    ? "name"
                    : undefined,
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
