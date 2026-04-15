import { UserPrismaRepository } from "@/modulos/user/infrastructure/repositories/user-prisma.repository";

import { BcryptHasher } from "@/shared/cryptography/bcrypt-hasher";
import { CreateAccountUseCase } from "../application/usecases/create-account.use-case";
import { AccountPrismaRepository } from "../infrastructure/http/repositories/prisma/account-prisma.repository";

// ── Repositories ──────────────────────────────────────────────────────────────

const userRepository = new UserPrismaRepository();
const accountRepository = new AccountPrismaRepository();

// ── Providers ─────────────────────────────────────────────────────────────────
const bcryptHasher = new BcryptHasher();

// ── Use Cases ─────────────────────────────────────────────────────────────────

export const createAccountUseCase = new CreateAccountUseCase(
  userRepository,
  accountRepository,
  bcryptHasher,
);
