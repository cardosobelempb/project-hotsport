import { Either } from "@/common/domain/errors/handle-errors/either";
import { AlreadyExistsError } from "@/common/domain/errors/usecases/already-exists.error";
import { SessionSummaryDto } from "@/modules/identity/application/dto/session.dto";
import { CreateSessionUseCase } from "@/modules/identity/application/usecases/create-session.usecase";
import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

export type CreateSessionUseCaseResponse = Either<
  AlreadyExistsError,
  SessionSummaryDto
>;

export const authSessionController = (
  authSessionUseCase: CreateSessionUseCase,
) => {
  return async (app: FastifyInstance): Promise<void> => {
    app.withTypeProvider<ZodTypeProvider>().route({
      method: "GET",
      url: "/",
      schema: {
        tags: ["Auth"],
        summary: "Authenticate a user",
        // response: AuthSessionResponseSchema,
      },
      handler: async (request, reply) => {
        // const result = await authSessionUseCase.execute({
        //   accessToken: request.cookies["access_token"] ?? "",
        // });
        // if (result.isLeft()) {
        //   const error = result.value;
        //   return reply.status(401).send({
        //     message: error.message,
        //     statusCode: 401,
        //     timestamp: new Date().toISOString(),
        //   });
        // }
        // return reply.send({ user: result.value.user });
      },
    });
  };
};
