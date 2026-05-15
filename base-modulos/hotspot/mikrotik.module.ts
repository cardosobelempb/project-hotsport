import { getPrismaClient } from "@/common/infrastructure/db/prisma.client";
import { TOKENS } from "@/common/shared/container/tokens";
import { BcryptHasher } from "@/common/shared/cryptography/bcrypt-hasher";
import { ModuleDefinition } from "@/common/shared/module/module.types";

import { CreateMikrotikUseCase } from "./application/usecases/create-mikrotik.use-case";
import { CreateMikrotikController } from "./infrastructure/http/controllers/create-mikrotik.controller";
import { PrismaMikrotikRepository } from "./infrastructure/http/repositories/prisma-mikrotik.repository";

const prisma = getPrismaClient();

export const mikrotikModule: ModuleDefinition = {
  providers: [
    {
      token: TOKENS.PRISMA_CLIENT,
      useValue: prisma,
    },
    {
      token: TOKENS.BCRYPT_HASHER,
      useClass: BcryptHasher,
    },
    {
      token: PrismaMikrotikRepository,
      useClass: PrismaMikrotikRepository,
    },
    {
      token: CreateMikrotikUseCase,
      useClass: CreateMikrotikUseCase,
    },
  ],

  controllers: [CreateMikrotikController],
};
