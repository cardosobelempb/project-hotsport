import { FastifyInstance } from "fastify";

import { CreateUserUseCase } from "@/modulos/identity/application/usecases/users/create-user.usecase";
import { userRegisterController } from "../controllers/user/user-register.controller";
import { UserPrismaRepository } from "../repositories/prisma/user-prisma.repository";

export async function userRoutes(app: FastifyInstance): Promise<void> {
  const userRepository = new UserPrismaRepository();
  const createUserUseCase = new CreateUserUseCase(userRepository); // instanciado uma vez aqui

  await app.register(userRegisterController(createUserUseCase));
  // await app.register(updatePaymentStatusController(userRegisterUseCase), {
  //   prefix: "/:id/status",
  // });
  // await app.register(getPaymentsController(userRegisterUseCase), { prefix: "/" });
}
