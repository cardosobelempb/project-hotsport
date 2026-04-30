import { OrganizationDeactivateUseCase } from "@/modulos/organization/application/usecases/organization/organization-deactivate.usecase";
import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

const OrganizationParamsSchema = z.object({
  organizationId: z.string().uuid(),
});

export const organizationDeactivateController = (
  organizationDeactivateUseCase: OrganizationDeactivateUseCase,
) => {
  return async (app: FastifyInstance): Promise<void> => {
    app.withTypeProvider<ZodTypeProvider>().route({
      method: "PATCH",
      url: "/deactivate/:organizationId",
      schema: {
        tags: ["Organization"],
        summary: "Busca uma organização por ID",
        params: OrganizationParamsSchema,
        response: {
          200: z.object({ message: z.string() }),
        },
      },
      handler: async (request, reply) => {
        const result = await organizationDeactivateUseCase.execute({
          organizationId: request.params.organizationId,
        });

        if (result.isLeft()) {
          throw result.value;
        }

        return reply.status(200).send({ message: result.value.message });
      },
    });
  };
};
