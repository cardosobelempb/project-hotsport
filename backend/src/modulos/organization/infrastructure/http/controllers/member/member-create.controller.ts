import {
  CreateMemberSchema,
  MemberCreateResponseSchema,
} from "@/modulos/organization/application/schemas/member.schema";
import { MemberCreateUseCase } from "@/modulos/organization/application/usecases/member/member-create.usecase";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

export const memberCreateController = (
  memberCreateUseCase: MemberCreateUseCase,
) => {
  return async (app: FastifyInstance): Promise<void> => {
    app.withTypeProvider<ZodTypeProvider>().route({
      method: "POST",
      url: "/",
      schema: {
        tags: ["Member"],
        summary: "Cria uma nova organização",
        body: CreateMemberSchema,
        response: MemberCreateResponseSchema,
      },
      handler: async (request, reply) => {
        const result = await memberCreateUseCase.execute(request.body);

        if (result.isLeft()) {
          throw result.value;
        }

        console.log("Controller =>", result.value);

        return reply.status(201).send(result.value);
      },
    });
  };
};
