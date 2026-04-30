import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { ErrorSchema } from "@/schemas/error";

import { ProcessPayment } from "../../../application/usecases";
import { CreatePaymentSchema, PaymentSchema } from "../schemas/payment.schema";

export const createPaymentController = (processPayment: ProcessPayment) => {
  return async (app: FastifyInstance): Promise<void> => {
    app.withTypeProvider<ZodTypeProvider>().route({
      method: "POST",
      url: "/",
      schema: {
        tags: ["Pagamentos"],
        summary: "Registrar pagamento",
        body: CreatePaymentSchema,
        response: {
          201: PaymentSchema,
          500: ErrorSchema,
        },
      },
      handler: async (request, reply) => {
        try {
          const result = await processPayment.execute(request.body);
          return reply.status(201).send(result);
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
