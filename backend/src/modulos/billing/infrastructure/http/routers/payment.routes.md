import { FastifyInstance } from "fastify";

import {
  GetPayments,
  ProcessPayment,
  UpdatePaymentStatus,
} from "@/usecases/PaymentUseCases";

import { createPaymentController } from "../../infrastructure/http/controllers/create-payment.controller";
import { getPaymentsController } from "../../infrastructure/http/controllers/get-payments.controller";
import { updatePaymentStatusController } from "../../infrastructure/http/controllers/update-payment-status.controller";

export async function registerPaymentRoutes(
  app: FastifyInstance,
): Promise<void> {
  const processPayment = new ProcessPayment(); // instanciado uma vez aqui
  const updatePaymentStatus = new UpdatePaymentStatus(); // instanciado uma vez aqui
  const getPayments = new GetPayments(); // instanciado uma vez aqui

  await app.register(createPaymentController(processPayment), { prefix: "/" });
  await app.register(updatePaymentStatusController(updatePaymentStatus), {
    prefix: "/:id/status",
  });
  await app.register(getPaymentsController(getPayments), { prefix: "/" });
}
