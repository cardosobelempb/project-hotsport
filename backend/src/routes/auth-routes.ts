import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import {
  ConflictError,
  CpfVO,
  PhoneVO,
  ValidationError,
} from "@/common/index.js";
import { loginAdminHandler } from "@/handlers/admin/login";
import { WhatsappError } from "@/modulos/whatsapp/domain/errors/WhatsappError";
import { LoginOutputSchema, LoginSchema } from "@/schemas/auth";
import { ErrorSchema } from "@/schemas/error";
import {
  OtpRequestBodySchema,
  OtpRequestResponseSchema,
} from "@/schemas/otp.js";
import { CreateOtpAuditLog, OtpAuditEvent } from "@/usecases/CreateOtpAuditLog";
import { RequestOtp } from "@/usecases/RequestOtp";

export const authRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/login",
    schema: {
      tags: ["Auth"],
      summary: "Autenticar administrador",
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
    method: "GET",
    url: "/me",
    schema: {
      tags: ["Auth"],
      summary: "Verificar token JWT",
      headers: z.object({
        authorization: z.string(),
      }),
      response: {
        200: z.object({ valid: z.boolean() }),
        401: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      const authHeader = request.headers["authorization"];
      if (!authHeader) {
        return reply
          .status(401)
          .send({ error: "Token não fornecido", code: "UNAUTHORIZED_ERROR" });
      }
      return reply.status(200).send({ valid: true });
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/otp/request",
    schema: {
      tags: ["Auth"],
      summary: "Solicitar OTP via WhatsApp (CPF + telefone)",
      body: OtpRequestBodySchema,
      response: {
        200: OtpRequestResponseSchema,
        409: ErrorSchema,
        422: ErrorSchema,
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
        const result = await new RequestOtp().execute({
          cpf: new CpfVO(request.body.cpf),
          phoneNumber: PhoneVO.create(request.body.phone),
        });
        await auditLog
          .execute({ event: "otp_sent", cpf, phone, ip })
          .catch((err) => app.log.warn({ err }, "OTP audit log write failed"));
        return reply.status(200).send({
          status: result.status === "enviado" ? "sent" : "error",
          detail: result.detail,
        });
      } catch (error) {
        app.log.error(error);
        const detail = error instanceof Error ? error.message : null;
        let auditEvent: OtpAuditEvent = "otp_request_error";
        if (error instanceof ValidationError)
          auditEvent = "otp_validation_error";
        else if (error instanceof ConflictError) auditEvent = "otp_throttled";
        else if (error instanceof WhatsappError)
          auditEvent = "otp_whatsapp_error";
        await auditLog
          .execute({
            event: auditEvent,
            cpf,
            phone,
            ip,
            ...(detail !== null && { detail }),
          })
          .catch((err) => app.log.warn({ err }, "OTP audit log write failed"));
        if (error instanceof ValidationError) {
          return reply
            .status(422)
            .send({ error: error.message, code: "VALIDATION_ERROR" });
        }
        if (error instanceof ConflictError) {
          return reply
            .status(409)
            .send({ error: error.message, code: "CONFLICT_ERROR" });
        }
        if (error instanceof WhatsappError) {
          return reply
            .status(200)
            .send({ status: "error", detail: error.message });
        }
        return reply
          .status(500)
          .send({ error: "Erro interno", code: "INTERNAL_SERVER_ERROR" });
      }
    },
  });
};
