import { OrganizationParamsSchema } from "@/modulos/organization/application/schemas/organization.shema";
import { OrganizationFindByIdUseCase } from "@/modulos/organization/application/usecases/organization/organization-find-by-id.usecase";
import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

export const organizationFindByIdController = (
  organizationFindByIdUseCase: OrganizationFindByIdUseCase,
) => {
  return async (app: FastifyInstance): Promise<void> => {
    app.withTypeProvider<ZodTypeProvider>().route({
      method: "GET",
      url: "/:organizationId",
      schema: {
        tags: ["Organization"],
        summary: "Busca uma organização por ID",
        params: OrganizationParamsSchema,
        // response: OrganizationFindByIdResponse,
      },
      handler: async (request, reply) => {
        const result = await organizationFindByIdUseCase.execute({
          organizationId: request.params.organizationId,
        });

        if (result.isLeft()) {
          throw result.value;
        }

        return reply.status(200).send(result.value);
      },
    });
  };
};
