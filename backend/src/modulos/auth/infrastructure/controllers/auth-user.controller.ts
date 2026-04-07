import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { AuthUserUseCase } from "../../application/usecases/AuthUserUseCase";

export const authUserController = (authUserUseCase: AuthUserUseCase) => {
  return async (app: FastifyInstance): Promise<void> => {
    app.withTypeProvider<ZodTypeProvider>().route({
      method: "GET",
      url: "/",
      schema: {
        tags: ["Auth"],
        summary: "Authenticate a user",
        // body: AuthLoginBodySchema,
        // response: {
        //   201: AuthLoginPresentSchema,
        //   409: ConflictError,
        //   422: ValidationErrorSchema,
        //   500: ErrorSchema,
        // },
      },
      handler: async (request, reply) => {
        // const result = await authUserUseCase.execute(request.body);
        // if (result.isLeft()) {
        //   const error = result.value;
        //   switch (error.constructor) {
        //     case ConflictError:
        //       return reply.status(409).send({
        //         message: error.message,
        //         statusCode: 409,
        //         timestamp: new Date().toISOString(),
        //         path: request.url,
        //         fieldName: error.path?.includes("email") ? "email" : "cpf",
        //         error: error.error,
        //       });
        //     default:
        //       return reply.status(422).send({
        //         message: error.message,
        //         statusCode: 422,
        //         timestamp: new Date().toISOString(),
        //         path: request.url,
        //         error: error.error,
        //       });
        //   }
        // }
        // // ✅ Envia { user: {...}, accessToken: "..." }
        // const { auth, user, accessToken, refreshToken } = result.value;
        // reply.cookie("access_token", accessToken, {
        //   httpOnly: true,
        //   secure: env.NODE_ENV === "production",
        //   sameSite: "strict",
        //   maxAge: 24 * 60 * 60 * 1000, // 1 dias
        // });
        // reply.cookie("refresh_token", refreshToken, {
        //   httpOnly: true,
        //   secure: env.NODE_ENV === "production",
        //   sameSite: "strict",
        //   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
        // });
        // return right({ message: "Login successful" });
      },
    });
  };
};
