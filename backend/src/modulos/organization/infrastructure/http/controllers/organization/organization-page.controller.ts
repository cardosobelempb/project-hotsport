import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { OrganizationPageUseCase } from "@/modulos/organization/application/usecases/organization/organization-page.usecase";
import { PageInputSchema } from "@/shared/schemas/pagination-schema";

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
        querystring: PageInputSchema,
        // response: OrganizationsResponseSchema,
      },
      handler: async (request, reply) => {
        const result = await organizationSearchUseCase.execute(request.query);

        if (result.isLeft()) {
          throw result.value;
        }

        // const page = result.value;
        // console.log(page);
        console.log("Page content:", result.value); // ✅ Conteúdo da página

        return reply.status(200).send({
          // ...page, // ✅ Todos os metadados da página
          content: result.value.content.map((org) => ({
            id: org.id.getValue(),
            name: org.name,
            slug: org.slug.getValue(),
            logoUrl: org.logoUrl ?? null,
            status: org.status ?? "unknown",
            createdAt: org.createdAt.toISOString(),
            updatedAt: org.updatedAt?.toISOString() ?? null,
            deletedAt: org.deletedAt?.toISOString() ?? null,
          })),
          pageable: result.value.pageable,
          totalPages: result.value.totalPages,
          totalElements: result.value.totalElements,
          last: result.value.last,
          size: result.value.size,
          number: result.value.number,
          sort: result.value.sort,
          first: result.value.first,
          numberOfElements: result.value.numberOfElements,
        });
      },
    });
  };
};
