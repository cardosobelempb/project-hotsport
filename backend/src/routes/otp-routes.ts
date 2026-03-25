import type { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

import {
  ErrorSchema,
  MessageSchema,
  RequestOtpSchema,
  VerifyOtpOutputSchema,
  VerifyOtpSchema,
} from '../schemas/index.js';
import { AppError, NotFoundError, RateLimitError } from '../errors/index.js';
import { RequestOtp } from '../usecases/RequestOtp.js';
import { VerifyOtp } from '../usecases/VerifyOtp.js';

export const otpRoutes = async (app: FastifyInstance) => {
  /**
   * POST /api/otp/request
   *
   * Upserts the User by CPF, generates a 6-digit OTP, stores its bcrypt hash
   * in UserOtp and returns a generic success message.
   * The plain-text OTP is logged at debug level so the WhatsApp layer (or any
   * downstream job) can pick it up and dispatch it.
   *
   * Rate-limited: max 1 request per 60 s and max 5 per hour, per CPF and phone.
   */
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/request',
    schema: {
      tags: ['OTP'],
      summary: 'Solicitar OTP via WhatsApp',
      body: RequestOtpSchema,
      response: {
        200: MessageSchema,
        429: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const useCase = new RequestOtp();
        const result = await useCase.execute(request.body);
        // The OTP is logged at debug level so the WhatsApp gateway / background
        // job can pick it up. It is NEVER returned in the HTTP response body.
        app.log.debug({ userId: result.userId, expiresAt: result.expiresAt, otp: result.otp }, 'OTP generated');
        return reply.status(200).send({ message: 'Código enviado com sucesso' });
      } catch (error) {
        if (error instanceof RateLimitError) {
          app.log.warn(
            { cpf: request.body.cpf, phone: request.body.phone, code: error.code },
            'OTP rate limit exceeded — possible abuse attempt',
          );
          return reply.status(429).send({ error: error.message, code: error.code });
        }
        app.log.error(error);
        return reply
          .status(500)
          .send({ error: 'Erro interno ao gerar OTP', code: 'INTERNAL_SERVER_ERROR' });
      }
    },
  });

  /**
   * POST /api/otp/verify
   *
   * Validates the plain-text OTP against the stored bcrypt hash for the given
   * CPF. Returns the user data on success so the client can proceed with
   * session creation.
   */
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/verify',
    schema: {
      tags: ['OTP'],
      summary: 'Verificar OTP e autenticar usuário',
      body: VerifyOtpSchema,
      response: {
        200: VerifyOtpOutputSchema,
        400: ErrorSchema,
        401: ErrorSchema,
        404: ErrorSchema,
        429: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const useCase = new VerifyOtp();
        const result = await useCase.execute(request.body);
        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);

        if (error instanceof NotFoundError) {
          return reply.status(404).send({ error: error.message, code: error.code });
        }
        if (error instanceof AppError) {
          if (error.code === 'OTP_MAX_ATTEMPTS') {
            app.log.warn(
              { cpf: request.body.cpf, code: error.code },
              'OTP max attempts exceeded — possible brute-force attempt',
            );
          }
          return reply.status(error.statusCode).send({ error: error.message, code: error.code });
        }
        return reply
          .status(500)
          .send({ error: 'Erro interno ao verificar OTP', code: 'INTERNAL_SERVER_ERROR' });
      }
    },
  });
};
