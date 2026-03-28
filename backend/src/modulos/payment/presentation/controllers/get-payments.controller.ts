import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { ErrorSchema } from "@/schemas/error";

import { GetPayments } from "../../application/usecases";
import { PaymentListSchema } from "../../infrastructure/schemas/payment.schema";

const GetPaymentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  perPage: z.coerce.number().int().min(1).max(100).optional(),
  filter: z.string().trim().optional(),
  sortBy: z
    .enum([
      "id",
      "planId",
      "email",
      "planName",
      "amountCents",
      "status",
      "mercadoPagoId",
      "createdAt",
      "expiresAt",
      "updatedAt",
      "macAddress",
      "cpf",
      "ipAddress",
    ])
    .optional(),
  sortDirection: z.enum(["asc", "desc"]).optional(),
});

export const getPaymentsController = (getPayments: GetPayments) => {
  return async (app: FastifyInstance): Promise<void> => {
    app.withTypeProvider<ZodTypeProvider>().route({
      method: "GET",
      url: "/",
      schema: {
        tags: ["Pagamentos"],
        summary: "Listar todos os pagamentos",
        querystring: GetPaymentsQuerySchema,
        response: {
          200: PaymentListSchema,
          500: ErrorSchema,
        },
      },
      handler: async (request, reply) => {
        try {
          const params = {
            ...(request.query.page !== undefined
              ? { page: request.query.page }
              : {}),
            ...(request.query.perPage !== undefined
              ? { perPage: request.query.perPage }
              : {}),
            ...(request.query.filter !== undefined
              ? { filter: request.query.filter }
              : {}),
            ...(request.query.sortBy !== undefined
              ? { sortBy: request.query.sortBy }
              : {}),
            ...(request.query.sortDirection !== undefined
              ? { sortDirection: request.query.sortDirection }
              : {}),
          };

          const result = await getPayments.execute(params);
          return reply.status(200).send(result);
        } catch (error) {
          app.log.error(error);
          return reply
            .status(500)
            .send({ error: "Erro interno", code: "INTERNAL_SERVER_ERROR" });
        }
      },
    });
  };
};
