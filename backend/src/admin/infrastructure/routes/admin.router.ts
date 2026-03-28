import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { LoginOutputSchema, LoginSchema } from "@/schemas/auth";
import { ErrorSchema } from "@/schemas/error";

import { adminLoginController } from "../controllers";

// export const adminRouter = async (app: FastifyInstance): Promise<void> => {
//   app.withTypeProvider<ZodTypeProvider>().route({
//     method: 'POST',
//     url: '/login',
//     schema: {
//       tags: ['Admin'],
//       summary: 'Autenticar administrador',
//       body: LoginSchema,
//       response: {
//         200: LoginOutputSchema,
//         401: ErrorSchema,
//         500: ErrorSchema,
//       },
//     },
//     handler: adminLoginController,
//   });
// };

export const adminRouter = async (app: FastifyInstance): Promise<void> => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/login",
    schema: {
      tags: ["Admin"],
      summary: "Autenticar administrador",
      body: LoginSchema,
      response: {
        200: LoginOutputSchema,
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: adminLoginController,
  });
};
