import { FastifyInstance } from "fastify";

import { createAccountUseCase } from "../../../container";
import { createAccountController } from "../controllers/create-account.controller";

export async function accountRoutes(app: FastifyInstance): Promise<void> {
  await app.register(createAccountController(createAccountUseCase));
}
