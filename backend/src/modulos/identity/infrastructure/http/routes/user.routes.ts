// modules/users/infra/routes/user.routes.ts

import type { FastifyInstance } from "fastify";

import { registerModule } from "@/common/shared/module/register-module";
import { userModule } from "@/modulos/identity/user.module";

export async function userRoutes(app: FastifyInstance): Promise<void> {
  // ✅ prefix aqui — envolve tudo que o registerModule registrar
  await app.register(
    async (router) => {
      await registerModule(router, userModule);
    },
    { prefix: "api/v1" },
  );
}
