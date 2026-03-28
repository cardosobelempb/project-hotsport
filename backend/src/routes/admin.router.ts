import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { LoginOutputSchema, LoginSchema } from "@/schemas/auth.js";
import { ErrorSchema } from "@/schemas/error.js';

import { adminLoginController } from '../controllers/admin/admin-login.controller.js";

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
