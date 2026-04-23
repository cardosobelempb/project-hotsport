import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { OrganizationSearchUseCase } from "@/modulos/organization/application/usecases/organization-search.usecase";
import {
  OrganizationSearchSchema,
  OrganizationsPresentSchema,
} from "../schemas/organization-search.shema";

export const organizationSearchController = (
  organizationSearchUseCase: OrganizationSearchUseCase,
) => {
  return async (app: FastifyInstance): Promise<void> => {
    app.withTypeProvider<ZodTypeProvider>().route({
      method: "GET",
      url: "/organizations",
      schema: {
        tags: ["Organization"],
        summary: "Lista organizações com paginação e filtro",
        querystring: OrganizationSearchSchema,
        response: OrganizationsPresentSchema,
      },
      handler: async (request, reply) => {
        const result = await organizationSearchUseCase.execute({
          page: request.query.page,
          perPage: request.query.perPage,
          filter: request.query.filter,
          sortBy: request.query.sortBy,
          sortDirection: request.query.sortDirection,
        });

        return reply.status(200).send({
          items: result.value?.items,
          meta: {
            currentPage: result.value?.items.length
              ? result.value?.meta.currentPage
              : 1,
            perPage: result.value?.items.length
              ? result.value?.meta.perPage
              : request.query.perPage,
            total: result.value?.items.length ? result.value?.meta.total : 0,
            totalPages: result.value?.items.length
              ? result.value?.meta.totalPages
              : 0,
            sortBy: result.value?.items.length
              ? result.value?.meta.sortBy
              : request.query.sortBy,
            sortDirection: result.value?.items.length
              ? result.value?.meta.sortDirection
              : request.query.sortDirection,
            filter: result.value?.items.length
              ? result.value?.meta.filter
              : request.query.filter,
          },
        });
      },
    });
  };
};
