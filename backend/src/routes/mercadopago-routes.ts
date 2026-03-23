import dayjs from 'dayjs';
import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

import { ConfigMercadoPagoResponseSchema, ConfigMercadoPagoSchema, ErrorSchema } from '../schemas/index.js';

export const mercadoPagoRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/',
    schema: {
      tags: ['MercadoPago'],
      summary: 'Configurar credenciais do MercadoPago',
      body: ConfigMercadoPagoSchema,
      response: {
        201: ConfigMercadoPagoResponseSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const data = request.body;
        return reply.status(201).send({
          id: 'placeholder',
          ...data,
          configurado_em: dayjs().toISOString(),
        });
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ error: 'Erro interno no servidor', code: 'INTERNAL_SERVER_ERROR' });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/',
    schema: {
      tags: ['MercadoPago'],
      summary: 'Buscar configuração do MercadoPago',
      response: {
        200: ConfigMercadoPagoResponseSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (_request, reply) => {
      try {
        return reply.status(404).send({ error: 'Configuração não encontrada', code: 'NOT_FOUND_ERROR' });
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ error: 'Erro interno no servidor', code: 'INTERNAL_SERVER_ERROR' });
      }
    },
  });
};
