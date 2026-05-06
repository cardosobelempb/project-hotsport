// modules/users/user.module.ts

import { getPrismaClient } from "@/common/infrastructure/db/prisma.client";
import { TOKENS } from "@/common/shared/container/tokens";
import { ModuleDefinition } from "@/common/shared/module/module.types";
import { UserCreateUseCase } from "./application/usecases/users/user-create.usecase";
import { UserCreateController } from "./infrastructure/http/controllers/user/user-register.controller";
import { PrismaUserRepository } from "./infrastructure/http/repositories/prisma/prisma-user.repository";

const prisma = getPrismaClient();

export const userModule: ModuleDefinition = {
  providers: [
    {
      token: TOKENS.PRISMA_CLIENT,
      useValue: prisma,
    },
    {
      token: PrismaUserRepository,
      useClass: PrismaUserRepository,
    },
    {
      token: UserCreateUseCase,
      useClass: UserCreateUseCase,
    },
  ],

  controllers: [UserCreateController],
};
