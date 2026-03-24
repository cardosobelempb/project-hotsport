import type { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { GetMercadoPagoConfig, SaveMercadoPagoConfig } from '../usecases/MercadoPagoUseCases.js';
import { ErrorSchema, ConfigMercadoPagoSchema, SaveMercadoPagoConfigSchema } from '../schemas/index.js';

export const mercadoPagoRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/',
    schema: {
      tags: ['MercadoPago'],
      summary: 'Obter configuração MercadoPago',
      response: {
        200: ConfigMercadoPagoSchema.nullable(),
        500: ErrorSchema,
      },
    },
    handler: async (_request, reply) => {
      try {
        const result = await new GetMercadoPagoConfig().execute();
        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ error: 'Erro interno', code: 'INTERNAL_SERVER_ERROR' });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/',
    schema: {
      tags: ['MercadoPago'],
      summary: 'Salvar configuração MercadoPago',
      body: SaveMercadoPagoConfigSchema,
      response: {
        200: ConfigMercadoPagoSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const body = request.body;
        const result = await new SaveMercadoPagoConfig().execute({
          ...('public_key' in body ? { public_key: body.public_key ?? null } : {}),
          ...('access_token' in body ? { access_token: body.access_token ?? null } : {}),
          ...('client_id' in body ? { client_id: body.client_id ?? null } : {}),
          ...('client_secret' in body ? { client_secret: body.client_secret ?? null } : {}),
          ...('webhook_secret' in body ? { webhook_secret: body.webhook_secret ?? null } : {}),
        });
        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ error: 'Erro interno', code: 'INTERNAL_SERVER_ERROR' });
      }
    },
  });

  // Webhook MercadoPago
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/webhook',
    schema: {
      tags: ['MercadoPago'],
      summary: 'Webhook MercadoPago',
      body: z.unknown(),
      response: {
        200: z.object({ received: z.boolean() }),
      },
    },
    handler: async (request, reply) => {
      app.log.info({ webhook: request.body }, 'MercadoPago webhook received');
      return reply.status(200).send({ received: true });
    },
  });
};
