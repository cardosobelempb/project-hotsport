import { FastifyInstance } from "fastify";

import { createMikrotikUseCase } from "../../../container";
import { mikrotikRegisterController } from "../controllers/create-mikrotik.controller";

export async function mikrotikRoutes(app: FastifyInstance): Promise<void> {
  await app.register(mikrotikRegisterController(createMikrotikUseCase));
  // await app.register(updatePaymentStatusController(mikrotikRegisterUseCase), {
  //   prefix: "/:id/status",
  // });
  // await app.register(getPaymentsController(mikrotikRegisterUseCase), { prefix: "/" });
}
