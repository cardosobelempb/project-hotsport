import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { OrganizationUpdateUseCase } from "@/modulos/organization/application/usecases/organization-update.usecase";
import { OrganizationUpdatePresentSchema } from "../schemas/organization-present.shema";
import { OrganizationUpdateSchema } from "../schemas/organization-update.shema";
import { OrganizationParamsSchema } from "../schemas/organization.shema";

export const organizationUpdateController = (
  organizationUpdateUseCase: OrganizationUpdateUseCase,
) => {
  return async (app: FastifyInstance): Promise<void> => {
    app.withTypeProvider<ZodTypeProvider>().route({
      method: "PUT",
      url: "/:organizationId",
      schema: {
        tags: ["Organization"],
        summary: "Atualiza uma organização",
        params: OrganizationParamsSchema,
        body: OrganizationUpdateSchema,
        response: OrganizationUpdatePresentSchema,
      },
      handler: async (request, reply) => {
        const result = await organizationUpdateUseCase.execute(
          { organizationId: request.params.organizationId },
          request.body,
        );

        console.log(request.params.organizationId);

        if (result.isLeft()) {
          throw result.value;
        }

        return reply.status(200).send(result.value.organization);
      },
    });
  };
};
