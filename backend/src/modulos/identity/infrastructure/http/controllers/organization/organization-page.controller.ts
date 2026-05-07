import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { OrganizationPageUseCase } from "@/modulos/identity/application/usecases/organization/organization-page.usecase";
import { OrganizationPageResponse } from "@/modulos/organization/application/schemas/organization.shema";
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

        return reply.status(200).send(result.value);
      },
    });
  };
};
