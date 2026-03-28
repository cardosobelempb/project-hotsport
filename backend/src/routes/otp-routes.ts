import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { CpfVO, PhoneVO } from "@/common/index.js";
import { RateLimitError } from "@/modulos/auth/domain/erros/RateLimitError.js";
import { ErrorSchema } from "@/schemas/error.js";
import { MessageSchema } from "@/schemas/generic.js";
import {
  RequestOtpSchema,
  VerifyOtpOutputSchema,
  VerifyOtpSchema,
} from "@/schemas/otp.js";

import { AppError, NotFoundError } from "../errors/index.js";
import {
  CreateOtpAuditLog,
  type OtpAuditEvent,
} from "../usecases/CreateOtpAuditLog.js";
import { RequestOtp } from "../usecases/RequestOtp.js";
import { VerifyOtp } from "../usecases/VerifyOtp.js";

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
    method: "POST",
    url: "/request",
    schema: {
      tags: ["OTP"],
      summary: "Solicitar OTP via WhatsApp",
      body: RequestOtpSchema,
      response: {
        200: MessageSchema,
        429: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const { cpf, phone } = request.body;
      const ip = request.ip;
      const auditLog = new CreateOtpAuditLog();

      await auditLog
        .execute({ event: "otp_requested", cpf, phone, ip })
        .catch((err) => app.log.warn({ err }, "OTP audit log write failed"));

      try {
        const useCase = new RequestOtp();
        const result = await useCase.execute({
          cpf: new CpfVO(request.body.cpf),
          phoneNumber: PhoneVO.create(request.body.phone),
        });
        // The OTP is logged at debug level so the WhatsApp gateway / background
        // job can pick it up. It is NEVER returned in the HTTP response body.
        app.log.debug({ otp: result.detail }, "OTP generated");
        await auditLog
          .execute({ event: "otp_sent", cpf, phone, ip })
          .catch((err) => app.log.warn({ err }, "OTP audit log write failed"));
        return reply
          .status(200)
          .send({ message: "Código enviado com sucesso" });
      } catch (error) {
        if (error instanceof RateLimitError) {
          app.log.warn(
            {
              cpf: request.body.cpf,
              phone: request.body.phone,
            },
            "OTP rate limit exceeded — possible abuse attempt",
          );
          return reply
            .status(429)
            .send({ error: error.message, code: "RATE_LIMIT_EXCEEDED" });
        }
        app.log.error(error);
        const detail = error instanceof Error ? error.message : null;
        await auditLog
          .execute({
            event: "otp_request_error",
            cpf,
            phone,
            ip,
            ...(detail !== null && { detail }),
          })
          .catch((err) => app.log.warn({ err }, "OTP audit log write failed"));
        return reply.status(500).send({
          error: "Erro interno ao gerar OTP",
          code: "INTERNAL_SERVER_ERROR",
        });
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
    method: "POST",
    url: "/verify",
    schema: {
      tags: ["OTP"],
      summary: "Verificar OTP e autenticar usuário",
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
      const { cpf } = request.body;
      const ip = request.ip;
      const auditLog = new CreateOtpAuditLog();

      await auditLog
        .execute({ event: "otp_verify_attempt", cpf, ip })
        .catch((err) => app.log.warn({ err }, "OTP audit log write failed"));

      try {
        const useCase = new VerifyOtp();
        const result = await useCase.execute(request.body);
        await auditLog
          .execute({ event: "otp_verified", cpf, ip })
          .catch((err) => app.log.warn({ err }, "OTP audit log write failed"));
        return reply.status(200).send(result);
      } catch (error) {
        app.log.error(error);

        const detail = error instanceof Error ? error.message : null;
        let auditEvent: OtpAuditEvent = "otp_request_error";
        if (error instanceof NotFoundError) {
          auditEvent = "otp_user_not_found";
        } else if (error instanceof AppError) {
          if (error.code === "OTP_NOT_FOUND") auditEvent = "otp_not_found";
          else if (error.code === "OTP_INVALID") auditEvent = "otp_invalid";
          else if (error.code === "OTP_MAX_ATTEMPTS")
            auditEvent = "otp_max_attempts";
        }
        await auditLog
          .execute({
            event: auditEvent,
            cpf,
            ip,
            ...(detail !== null && { detail }),
          })
          .catch((err) => app.log.warn({ err }, "OTP audit log write failed"));

        if (error instanceof NotFoundError) {
          return reply
            .status(404)
            .send({ error: error.message, code: error.code });
        }
        if (error instanceof AppError) {
          if (error.code === "OTP_MAX_ATTEMPTS") {
            app.log.warn(
              { cpf: request.body.cpf, code: error.code },
              "OTP max attempts exceeded — possible brute-force attempt",
            );
          }
          return reply
            .status(400)
            .send({ error: error.message, code: error.code });
        }
        return reply.status(500).send({
          error: "Erro interno ao verificar OTP",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });
};
