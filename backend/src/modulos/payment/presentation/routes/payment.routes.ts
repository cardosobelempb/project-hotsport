import { FastifyInstance } from "fastify";

import {
  GetPayments,
  ProcessPayment,
  UpdatePaymentStatus,
} from "@/usecases/PaymentUseCases";

import { createPaymentController } from "../controllers/create-payment.controller";
import { getPaymentsController } from "../controllers/get-payments.controller";
import { updatePaymentStatusController } from "../controllers/update-payment-status.controller";

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
