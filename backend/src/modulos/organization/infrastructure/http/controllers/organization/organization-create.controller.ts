import {
  CreateOrganizationSchema,
  OrganizationCreateResponse,
} from "@/modulos/organization/application/schemas/organization.shema";
import { OrganizationCreateUseCase } from "@/modulos/organization/application/usecases/organization/organization-create.usecase";
import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

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
        body: CreateOrganizationSchema,
        response: OrganizationCreateResponse,
      },
      handler: async (request, reply) => {
        const result = await organizationCreateUseCase.execute(request.body);

        if (result.isLeft()) {
          throw result.value;
        }

        return reply.status(201).send(result.value);
      },
    });
  };
};
