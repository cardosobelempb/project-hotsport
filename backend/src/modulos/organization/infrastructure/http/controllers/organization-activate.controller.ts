import { OrganizationActivateUseCase } from "@/modulos/organization/application/usecases/organization-activate.usecase";
import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { OrganizationActivatePresentSchema } from "../schemas/organization-present.shema";

const OrganizationParamsSchema = z.object({
  organizationId: z.string().uuid(),
});

export const organizationActivateController = (
  organizationActivateUseCase: OrganizationActivateUseCase,
) => {
  return async (app: FastifyInstance): Promise<void> => {
    app.withTypeProvider<ZodTypeProvider>().route({
      method: "GET",
      url: "/activate/:organizationId",
      schema: {
        tags: ["Organization"],
        summary: "Busca uma organização por ID",
        params: OrganizationParamsSchema,
        response: OrganizationActivatePresentSchema,
      },
      handler: async (request, reply) => {
        const result = await organizationActivateUseCase.execute({
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
