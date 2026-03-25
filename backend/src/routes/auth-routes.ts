import type { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { ConflictError, ValidationError, WhatsappError } from '../errors/index.js';
import { loginAdminHandler } from '../handlers/admin/login.js';
import { ErrorSchema, LoginOutputSchema, LoginSchema, OtpRequestBodySchema, OtpRequestResponseSchema } from '../schemas/index.js';
import { RequestOtp } from '../usecases/RequestOtp.js';

export const authRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/login',
    schema: {
      tags: ['Auth'],
      summary: 'Autenticar administrador',
      body: LoginSchema,
      response: {
        200: LoginOutputSchema,
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: loginAdminHandler,
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/me',
    schema: {
      tags: ['Auth'],
      summary: 'Verificar token JWT',
      headers: z.object({
        authorization: z.string(),
      }),
      response: {
        200: z.object({ valid: z.boolean() }),
        401: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const authHeader = request.headers['authorization'];
      if (!authHeader) {
        return reply.status(401).send({ error: 'Token não fornecido', code: 'UNAUTHORIZED_ERROR' });
      }
      return reply.status(200).send({ valid: true });
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/otp/request',
    schema: {
      tags: ['Auth'],
      summary: 'Solicitar OTP via WhatsApp (CPF + telefone)',
      body: OtpRequestBodySchema,
      response: {
        200: OtpRequestResponseSchema,
        409: ErrorSchema,
        422: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const result = await new RequestOtp().execute(request.body);
        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);
        if (error instanceof ValidationError) {
          return reply.status(422).send({ error: error.message, code: error.code });
        }
        if (error instanceof ConflictError) {
          return reply.status(409).send({ error: error.message, code: error.code });
        }
        if (error instanceof WhatsappError) {
          return reply.status(200).send({ status: 'erro', detail: error.message });
        }
        return reply.status(500).send({ error: 'Erro interno', code: 'INTERNAL_SERVER_ERROR' });
      }
    },
  });
};
