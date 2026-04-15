import { FastifyInstance } from "fastify";

import { authLoginUseCase, authSessionUseCase } from "../../../container";
import { authLoginController } from "../controllers/auth-login.controller";
import { authSessionController } from "../controllers/auth-session.controller";

export async function authRoutes(app: FastifyInstance): Promise<void> {
  await app.register(authLoginController(authLoginUseCase), {
    prefix: "/signin",
  });

  await app.register(() => {}, {
    prefix: "/signup",
  });

  await app.register(() => {}, {
    prefix: "/refresh",
  });

  await app.register(() => {}, {
    prefix: "/reset-password",
  });

  await app.register(() => {}, {
    prefix: "/logout",
  });

  await app.register(authSessionController(authSessionUseCase), {
    prefix: "/session",
  });
}
