import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { fastifyToFetch, fetchToFastifyReply } from "@/lib/fastifyFetch.js";
import { ErrorSchema, LoginOutputSchema, LoginSchema } from "@/schemas";

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
    async handler(request, reply) {
      try {
        const fetchRequest = fastifyToFetch(request);
        const response = await auth.handler(fetchRequest);
        await fetchToFastifyReply(reply, response);
      } catch (error) {
        app.log.error({ error }, "Authentication error");
        reply.status(500).send({
          error: "Internal authentication error",
          code: "AUTH_FAILURE",
        });
      }
    },
  });
};
