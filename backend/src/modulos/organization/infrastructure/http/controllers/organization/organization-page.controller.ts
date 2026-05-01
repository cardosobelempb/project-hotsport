import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { OrganizationPageResponse } from "@/modulos/organization/application/schemas/organization.shema";
import { OrganizationPageUseCase } from "@/modulos/organization/application/usecases/organization/organization-page.usecase";
import { PageQuerySchema } from "@/shared/schemas/page-query.schema";

export const organizationSearchController = (
  organizationSearchUseCase: OrganizationPageUseCase,
) => {
  return async (app: FastifyInstance): Promise<void> => {
    app.withTypeProvider<ZodTypeProvider>().route({
      method: "GET",
      url: "/",
      schema: {
        tags: ["Organization"],
        summary: "Lista organizações com paginação e filtro",
        querystring: PageQuerySchema,
        response: OrganizationPageResponse,
      },
      handler: async (request, reply) => {
        const result = await organizationSearchUseCase.execute(request.query);

        if (result.isLeft()) {
          return reply.status(500).send({
            statusCode: 500,
            message: "Internal server error",
            timestamp: new Date().toISOString(),
          });
        }

        // ✅ Mapeia content: Entity[] → DTO[]
        // const page: Page<OrganizationPresenter> = {
        //   ...result.value,
        //   content: result.value.content.map(OrganizationMapper.toPage),
        // };

        console.log("Mapped Page result:", result); // ✅ Verifica o resultado mapeado da página

        return reply.status(200).send(result.value);
      },
    });
  };
};
