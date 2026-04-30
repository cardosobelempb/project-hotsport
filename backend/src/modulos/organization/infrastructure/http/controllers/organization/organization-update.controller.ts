import {
  OrganizationParamsSchema,
  OrganizationUpdateResponse,
  UpdateOrganizationSchema,
} from "@/modulos/organization/application/schemas/organization.shema";
import { OrganizationUpdateUseCase } from "@/modulos/organization/application/usecases/organization/organization-update.usecase";
import { OrganizationMapper } from "@/modulos/organization/domain/mappers/organization.mapper";
import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

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
        body: UpdateOrganizationSchema,
        response: OrganizationUpdateResponse,
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

        const { organization } = result.value;

        return reply
          .status(200)
          .send({ organization: OrganizationMapper.toPresenter(organization) });
      },
    });
  };
};
