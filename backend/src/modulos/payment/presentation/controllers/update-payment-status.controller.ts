import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import { NotFoundError } from "@/errors";
import { ErrorSchema } from "@/schemas/error";
import { ParamsIdStringSchema } from "@/schemas/generic";

import { UpdatePaymentStatus } from "../../application/usecases";
import { PaymentSchema } from "../../infrastructure/schemas/payment.schema";

export const updatePaymentStatusController = (
  updatePaymentStatus: UpdatePaymentStatus,
) => {
  return async (app: FastifyInstance): Promise<void> => {
    app.withTypeProvider<ZodTypeProvider>().route({
      method: "PATCH",
      url: "/:id/status",
      schema: {
        tags: ["Pagamentos"],
        summary: "Atualizar status do pagamento",
        params: ParamsIdStringSchema,
        body: z.object({ status: z.string().min(1) }),
        response: {
          200: PaymentSchema,
          404: ErrorSchema,
          500: ErrorSchema,
        },
      },
      handler: async (request, reply) => {
        try {
          const result = await updatePaymentStatus.execute({
            id: request.params.id,
            status: request.body.status,
          });
          return reply.status(200).send(result);
        } catch (error) {
          app.log.error(error);
          if (error instanceof NotFoundError) {
            return reply
              .status(404)
              .send({ error: error.message, code: error.code });
          }
          return reply
            .status(500)
            .send({ error: "Erro interno", code: "INTERNAL_SERVER_ERROR" });
        }
      },
    });
  };
};
