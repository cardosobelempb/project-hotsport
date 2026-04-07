import { UserPrismaRepository } from "@/modulos/user/infrastructure/repositories/user-prisma.repository";

import { env } from "@/core/infrastructure/env";
import { FastifyInstance } from "fastify";
import { AuthLoginUseCase } from "../../application/usecases/AuthLoginUseCase";
import { AuthRegisterUseCase } from "../../application/usecases/AuthRegisterUseCase";
import { AuthUserUseCase } from "../../application/usecases/AuthUserUseCase";
import { JwtTokenUseCase } from "../../application/usecases/JwtTokenUseCase";
import { authLoginController } from "../controllers/auth-login.controller";
import { authRegisterController } from "../controllers/auth-register.controller";
import { authUserController } from "../controllers/auth-user.controller";
import { BcryptHasher } from "../cryptography/bcrypt-hasher";
import { AuthPrismaRepository } from "../repositories/auth-prisma.repository";

export async function authRoutes(app: FastifyInstance): Promise<void> {
  const userRepository = new UserPrismaRepository();
  const authRepository = new AuthPrismaRepository();
  const bcryptHasher = new BcryptHasher();
  const jwtTokenUseCase = new JwtTokenUseCase(env); // ✅ Criar instância do JWT encrypter

  const authRegisterUseCase = new AuthRegisterUseCase(
    userRepository,
    authRepository,
  );
  const authLoginUseCase = new AuthLoginUseCase(
    userRepository,
    authRepository,
    bcryptHasher,
    jwtTokenUseCase,
  );

  const authUserUseCase = new AuthUserUseCase(
    userRepository,
    authRepository,
    bcryptHasher,
    jwtTokenUseCase,
  );

  await app.register(authRegisterController(authRegisterUseCase), {
    prefix: "/register",
  });
  await app.register(authLoginController(authLoginUseCase), {
    prefix: "/login",
  });
  await app.register(authUserController(authUserUseCase), {
    prefix: "/session",
  });
  // await app.register(updatePaymentStatusController(userRegisterUseCase), {
  //   prefix: "/:id/status",
  // });
  // await app.register(getPaymentsController(userRegisterUseCase), { prefix: "/" });
}
