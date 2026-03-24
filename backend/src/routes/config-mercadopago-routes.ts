import { fromNodeHeaders } from 'better-auth/node';
import { type FastifyInstance } from 'fastify';
import { type ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { auth } from '../lib/auth.js';
import { ConfigMercadoPagoSchema,ErrorSchema } from '../schemas/index.js';

export const configMercadoPagoRoutes = async (app: FastifyInstance): Promise<void> => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/',
    schema: {
      tags: ['Configurações'],
      summary: 'Obter configurações do Mercado Pago',
      response: {
        200: ConfigMercadoPagoSchema,
        401: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
        if (!session) return reply.status(401).send({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
        return reply.status(200).send({
          id: 1,
          public_key: null,
          access_token: null,
          client_id: null,
          client_secret: null,
          webhook_secret: null,
        });
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'PUT',
    url: '/',
    schema: {
      tags: ['Configurações'],
      summary: 'Atualizar configurações do Mercado Pago',
      body: z.object({
        public_key: z.string().nullable().optional(),
        access_token: z.string().nullable().optional(),
        client_id: z.string().nullable().optional(),
        client_secret: z.string().nullable().optional(),
        webhook_secret: z.string().nullable().optional(),
      }),
      response: {
        200: ConfigMercadoPagoSchema,
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
        if (!session) return reply.status(401).send({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
        return reply.status(200).send({
          id: 1,
          public_key: request.body.public_key ?? null,
          access_token: request.body.access_token ?? null,
          client_id: request.body.client_id ?? null,
          client_secret: request.body.client_secret ?? null,
          webhook_secret: request.body.webhook_secret ?? null,
        });
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
      }
    },
  });
};
