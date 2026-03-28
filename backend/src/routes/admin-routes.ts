import { fromNodeHeaders } from "better-auth/node";
import { type FastifyInstance } from "fastify";
import { type ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { ErrorSchema } from "@/schemas/error.js";
import { MessageSchema } from "@/schemas/generic";

import { authRoutes } from "./auth-routes";

export const adminRoutes = async (app: FastifyInstance): Promise<void> => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/perfil",
    schema: {
      tags: ["Admin"],
      summary: "Obter perfil do administrador autenticado",
      response: {
        200: z.object({ id: z.number().int(), email: z.string() }),
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const session = await authRoutes.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });
        if (!session)
          return reply
            .status(401)
            .send({ error: "Unauthorized", code: "UNAUTHORIZED" });
        return reply.status(200).send({ id: 1, email: session.user.email });
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({
          error: "Internal server error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "PUT",
    url: "/senha",
    schema: {
      tags: ["Admin"],
      summary: "Alterar senha do administrador",
      body: z.object({
        senha_atual: z.string().min(1),
        nova_senha: z.string().min(6),
      }),
      response: {
        200: MessageSchema,
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const session = await authRoutes.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });
        if (!session)
          return reply
            .status(401)
            .send({ error: "Unauthorized", code: "UNAUTHORIZED" });
        return reply
          .status(200)
          .send({ message: "Senha alterada com sucesso" });
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({
          error: "Internal server error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });
};
