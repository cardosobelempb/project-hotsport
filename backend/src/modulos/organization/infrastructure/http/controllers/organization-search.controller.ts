import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { OrganizationSearchUseCase } from "@/modulos/organization/application/usecases/organization-search.usecase";
import { PaginatedPresentSchema } from "@/shared/schemas/paginated-present.schema";
import { OrganizationSearchSchema } from "../schemas/organization-search.shema";

export const organizationSearchController = (
  organizationSearchUseCase: OrganizationSearchUseCase,
) => {
  return async (app: FastifyInstance): Promise<void> => {
    app.withTypeProvider<ZodTypeProvider>().route({
      method: "GET",
      url: "/",
      schema: {
        tags: ["Organization"],
        summary: "Lista organizações com paginação e filtro",
        querystring: OrganizationSearchSchema,
        response: PaginatedPresentSchema,
      },
      handler: async (request, reply) => {
        const result = await organizationSearchUseCase.execute(request.query);

        if (result.isRight()) {
          return reply.status(200).send(result.value);
        }
      },
    });
  };
};
