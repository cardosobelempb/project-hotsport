import type { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { RegisterLgpdConsent, GetLgpdData } from '../usecases/LgpdUseCases.js';
import {
  ErrorSchema,
  LgpdLoginSchema,
  RegisterLgpdSchema,
} from '../schemas/index.js';

export const lgpdRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/',
    schema: {
      tags: ['LGPD'],
      summary: 'Listar registros LGPD',
      response: {
        200: z.array(LgpdLoginSchema),
        500: ErrorSchema,
      },
    },
    handler: async (_request, reply) => {
      try {
        const result = await new GetLgpdData().execute();
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
      tags: ['LGPD'],
      summary: 'Registrar consentimento LGPD',
      body: RegisterLgpdSchema,
      response: {
        201: LgpdLoginSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const body = request.body;
        const result = await new RegisterLgpdConsent().execute({
          cpf: body.cpf,
          aceite: body.aceite,
          ...(body.mac !== undefined ? { mac: body.mac } : {}),
          ...(body.ip !== undefined ? { ip: body.ip } : {}),
          ...(body.nome !== undefined ? { nome: body.nome } : {}),
          ...(body.telefone !== undefined ? { telefone: body.telefone } : {}),
        });
        return reply.status(201).send(result);
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({ error: 'Erro interno', code: 'INTERNAL_SERVER_ERROR' });
      }
    },
  });
};
