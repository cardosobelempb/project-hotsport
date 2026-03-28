import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { ErrorSchema } from "@/schemas/error.js";
import {
  MercadoPagoConfigSchema,
  SaveMercadoPagoConfigSchema,
} from "@/schemas/mercadopago.js";

import {
  GetMercadoPagoConfig,
  SaveMercadoPagoConfig,
} from "../usecases/MercadoPagoUseCases.js";

export const mercadoPagoRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/",
    schema: {
      tags: ["MercadoPago"],
      summary: "Obter configuração MercadoPago",
      response: {
        200: MercadoPagoConfigSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (_request, reply) => {
      try {
        const result = await new GetMercadoPagoConfig().execute();
        if (!result) {
          return reply
            .status(404)
            .send({ error: "Configuração não encontrada", code: "NOT_FOUND" });
        }
        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);
        return reply
          .status(500)
          .send({ error: "Erro interno", code: "INTERNAL_SERVER_ERROR" });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/",
    schema: {
      tags: ["MercadoPago"],
      summary: "Salvar configuração MercadoPago",
      body: SaveMercadoPagoConfigSchema,
      response: {
        200: MercadoPagoConfigSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const body = request.body;
        const result = await new SaveMercadoPagoConfig().execute({
          ...("publicKey" in body
            ? { public_key: body.publicKey ?? null }
            : {}),
          ...("accessToken" in body
            ? { access_token: body.accessToken ?? null }
            : {}),
          ...("clientId" in body ? { client_id: body.clientId ?? null } : {}),
          ...("clientSecret" in body
            ? { client_secret: body.clientSecret ?? null }
            : {}),
          ...("webhookSecret" in body
            ? { webhook_secret: body.webhookSecret ?? null }
            : {}),
        });
        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);
        return reply
          .status(500)
          .send({ error: "Erro interno", code: "INTERNAL_SERVER_ERROR" });
      }
    },
  });

  // Webhook MercadoPago
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/webhook",
    schema: {
      tags: ["MercadoPago"],
      summary: "Webhook MercadoPago",
      body: z.unknown(),
      response: {
        200: z.object({ received: z.boolean() }),
      },
    },
    handler: async (request, reply) => {
      app.log.info({ webhook: request.body }, "MercadoPago webhook received");
      return reply.status(200).send({ received: true });
    },
  });
};
