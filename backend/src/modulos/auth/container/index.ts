import { JwtTokenProvider } from "@/providers/token/jwt-token.provider";

import { env } from "@/common/infrastructure/env";
import { AccountPrismaRepository } from "@/modulos/account/infrastructure/http/repositories/prisma/account-prisma.repository";
import { AuthSessionUseCase } from "@/modulos/auth/application/usecases/auth-session.use-case";
import { AuthLoginUseCase } from "@/modulos/auth/application/usecases/signin-auth.use-case";
import { UserPrismaRepository } from "@/modulos/user/infrastructure/htttp/repositories/prisma/user-prisma.repository";
import { BcryptHasher } from "@/shared/cryptography/bcrypt-hasher";

// ── Repositories ──────────────────────────────────────────────────────────────

const userRepository = new UserPrismaRepository();
const accountRepository = new AccountPrismaRepository();

// ── Providers ─────────────────────────────────────────────────────────────────

const bcryptHasher = new BcryptHasher();
const jwtTokenProvider = new JwtTokenProvider(env);

// ── Use Cases ─────────────────────────────────────────────────────────────────

export const authLoginUseCase = new AuthLoginUseCase(
  userRepository,
  accountRepository,
  bcryptHasher,
  jwtTokenProvider,
);

export const authSessionUseCase = new AuthSessionUseCase(userRepository);
