import type { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { GetEfiConfig, SaveEfiConfig } from '../usecases/EfiUseCases.js';
import { ErrorSchema, EfiConfigSchema, SaveEfiConfigSchema } from '../schemas/index.js';

export const efiRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/',
    schema: {
      tags: ['EFI'],
      summary: 'Obter configuração EFI',
      response: {
        200: EfiConfigSchema.nullable(),
        500: ErrorSchema,
      },
    },
    handler: async (_request, reply) => {
      try {
        const result = await new GetEfiConfig().execute();
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
      tags: ['EFI'],
      summary: 'Salvar configuração EFI',
      body: SaveEfiConfigSchema,
      response: {
        200: EfiConfigSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const body = request.body;
        const result = await new SaveEfiConfig().execute({
          client_id: body.client_id,
          client_secret: body.client_secret,
          chave_pix: body.chave_pix,
          ambiente: body.ambiente,
          ...(body.certificado_nome !== undefined ? { certificado_nome: body.certificado_nome } : {}),
        });
        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ error: 'Erro interno', code: 'INTERNAL_SERVER_ERROR' });
      }
    },
  });

  // Webhook PIX
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/webhook',
    schema: {
      tags: ['EFI'],
      summary: 'Webhook EFI PIX',
      body: z.unknown(),
      response: {
        200: z.object({ received: z.boolean() }),
      },
    },
    handler: async (request, reply) => {
      app.log.info({ webhook: request.body }, 'EFI webhook received');
      return reply.status(200).send({ received: true });
    },
  });
};
