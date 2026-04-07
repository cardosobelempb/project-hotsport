import { fromNodeHeaders } from "better-auth/node";
import { type FastifyInstance } from "fastify";
import { type ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { NotFoundError } from "../shared/errors/index.js";
import { auth } from "../shared/lib/auth.js";
import { ErrorSchema } from "../shared/schemas/error.js";
import { MessageSchema } from "../shared/schemas/generic.js";
import { PaymentSchema } from "../shared/schemas/payment.js";

export const paymentsRoutes = async (app: FastifyInstance): Promise<void> => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/",
    schema: {
      tags: ["Payments"],
      summary: "Listar todos os payments registrados",
      response: {
        200: z.array(PaymentSchema),
        401: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });
        if (!session)
          return reply
            .status(401)
            .send({ error: "Unauthorized", code: "UNAUTHORIZED" });
        return reply.status(200).send([]);
      } catch (error) {
        app.log.error(error);
        return reply.status(500).send({
          error: "Internal server error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:id",
    schema: {
      tags: ["Payments"],
      summary: "Buscar payment por ID",
      params: z.object({ id: z.coerce.number().int() }),
      response: {
        200: PaymentSchema,
        401: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });
        if (!session)
          return reply
            .status(401)
            .send({ error: "Unauthorized", code: "UNAUTHORIZED" });
        throw new NotFoundError("Payment não encontrado");
      } catch (error) {
        app.log.error(error);
        if (error instanceof NotFoundError)
          return reply
            .status(404)
            .send({ error: error.message, code: error.code });
        return reply.status(500).send({
          error: "Internal server error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "DELETE",
    url: "/:id",
    schema: {
      tags: ["Payments"],
      summary: "Cancelar/remover payment",
      params: z.object({ id: z.coerce.number().int() }),
      response: {
        200: MessageSchema,
        401: ErrorSchema,
        404: ErrorSchema,
        500: ErrorSchema,
      },
    },
    handler: async (request, reply) => {
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(request.headers),
        });
        if (!session)
          return reply
            .status(401)
            .send({ error: "Unauthorized", code: "UNAUTHORIZED" });
        return reply
          .status(200)
          .send({ message: "Payment removido com sucesso" });
      } catch (error) {
        app.log.error(error);
        if (error instanceof NotFoundError)
          return reply
            .status(404)
            .send({ error: error.message, code: error.code });
        return reply.status(500).send({
          error: "Internal server error",
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    },
  });
};
