import { fromNodeHeaders } from "better-auth/node";
import { type FastifyInstance } from "fastify";
import { type ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { auth } from "../lib/auth.js";
import { ErrorSchema } from "../schemas/error.js";
import { MercadoPagoConfigSchema } from "../schemas/mercadopago.js";

export const configMercadoPagoRoutes = async (
  app: FastifyInstance,
): Promise<void> => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/",
    schema: {
      tags: ["Configurações"],
      summary: "Obter configurações do Mercado Pago",
      response: {
        200: MercadoPagoConfigSchema,
        401: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });
        if (!session)
          return reply
            .status(401)
            .send({ error: "Unauthorized", code: "UNAUTHORIZED" });
        return reply.status(200).send({
          id: "550e8400-e29b-41d4-a716-446655440000",
          publicKey: null,
          accessToken: null,
          clientId: null,
          clientSecret: null,
          webhookSecret: null,
        });
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
    url: "/",
    schema: {
      tags: ["Configurações"],
      summary: "Atualizar configurações do Mercado Pago",
      body: z.object({
        public_key: z.string().nullable().optional(),
        access_token: z.string().nullable().optional(),
        client_id: z.string().nullable().optional(),
        client_secret: z.string().nullable().optional(),
        webhook_secret: z.string().nullable().optional(),
      }),
      response: {
        200: MercadoPagoConfigSchema,
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });
        if (!session)
          return reply
            .status(401)
            .send({ error: "Unauthorized", code: "UNAUTHORIZED" });
        return reply.status(200).send({
          id: "550e8400-e29b-41d4-a716-446655440000",
          publicKey: request.body.public_key ?? null,
          accessToken: request.body.access_token ?? null,
          clientId: request.body.client_id ?? null,
          clientSecret: request.body.client_secret ?? null,
          webhookSecret: request.body.webhook_secret ?? null,
        });
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
