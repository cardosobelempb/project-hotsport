import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { ErrorSchema } from "@/schemas/error.js";
import { LgpdLoginSchema, RegisterLgpdSchema } from "@/schemas/lgpd.js";

import { GetLgpdData, RegisterLgpdConsent } from "../usecases/LgpdUseCases.js";

export const lgpdRoutes = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/",
    schema: {
      tags: ["LGPD"],
      summary: "Listar registros LGPD",
      response: {
        200: z.array(
          LgpdLoginSchema.omit({ mac: true, ip: true, phone: true }).extend({
            mac: z.string().nullable(),
            ip: z.string().nullable(),
            phone: z.string().nullable(),
          }),
        ),
        500: ErrorSchema,
      },
    },
    handler: async (_request, reply) => {
      try {
        const result = await new GetLgpdData().execute();
        const mapped = result.map((item) => ({
          id: item.id,
          cpf: item.cpf,
          accepted: item.accepted,
          createdAt: item.createdAt,
          name: item.name,
          mac: null as string | null,
          ip: null as string | null,
          phone: null as string | null,
        }));
        return reply.status(200).send(mapped);
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
      tags: ["LGPD"],
      summary: "Registrar consentimento LGPD",
      body: RegisterLgpdSchema,
      response: {
        201: LgpdLoginSchema.omit({ mac: true, ip: true, phone: true }).extend({
          mac: z.string().nullable(),
          ip: z.string().nullable(),
          phone: z.string().nullable(),
        }),
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const body = request.body;
        const result = await new RegisterLgpdConsent().execute({
          cpf: body.cpf,
          accepted: body.accepted,
          ...(body.mac !== undefined ? { mac: body.mac } : {}),
          ...(body.ip !== undefined ? { ip: body.ip } : {}),
          ...(body.name !== undefined ? { name: body.name } : {}),
          ...(body.phone !== undefined ? { phone: body.phone } : {}),
        });
        const mapped = {
          id: result.id,
          cpf: result.cpf,
          accepted: result.accepted,
          createdAt: result.createdAt,
          name: result.name,
          mac: null as string | null,
          ip: null as string | null,
          phone: null as string | null,
        };
        return reply.status(201).send(mapped);
      } catch (error) {
        app.log.error(error);
        return reply
          .status(500)
          .send({ error: "Erro interno", code: "INTERNAL_SERVER_ERROR" });
      }
    },
  });
};
