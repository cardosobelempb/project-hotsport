import { FastifyInstance } from "fastify";

import { UserRegisterUseCase } from "../../../application/usecases/user-register.usecase";
import { UserPrismaRepository } from "../../repositories/user-prisma.repository";
import { userRegisterController } from "../controllers/user-register.controller";

export async function userRoutes(app: FastifyInstance): Promise<void> {
  const userRepository = new UserPrismaRepository();
  const userRegisterUseCase = new UserRegisterUseCase(userRepository); // instanciado uma vez aqui

  await app.register(userRegisterController(userRegisterUseCase));
  // await app.register(updatePaymentStatusController(userRegisterUseCase), {
  //   prefix: "/:id/status",
  // });
  // await app.register(getPaymentsController(userRegisterUseCase), { prefix: "/" });
}
