import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { OrganizationCreateUseCase } from "@/modulos/organization/application/usecases/organization-create.usecase";
import { OrganizationCreateSchema } from "../schemas/organization-create.shema";
import { OrganizationCreatePresentSchema } from "../schemas/organization-present.shema";

export const organizationCreateController = (
  organizationCreateUseCase: OrganizationCreateUseCase,
) => {
  return async (app: FastifyInstance): Promise<void> => {
    app.withTypeProvider<ZodTypeProvider>().route({
      method: "POST",
      url: "/",
      schema: {
        tags: ["Organization"],
        summary: "Cria uma nova organização",
        body: OrganizationCreateSchema,
        response: OrganizationCreatePresentSchema,
      },
      handler: async (request, reply) => {
        const result = await organizationCreateUseCase.execute(request.body);

        if (result.isLeft()) {
          throw result.value;
        }

        return reply.status(201).send(result.value.organization);
      },
    });
  };
};
