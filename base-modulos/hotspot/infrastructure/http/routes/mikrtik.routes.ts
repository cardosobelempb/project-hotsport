import type { FastifyInstance } from "fastify";

import { registerModule } from "@/common/shared/module/register-module";
import { mikrotikModule } from "../../../mikrotik.module";

export async function mikrotikRoutes(app: FastifyInstance): Promise<void> {
  // ✅ prefix aqui — envolve tudo que o registerModule registrar
  await app.register(
    async (router) => {
      await registerModule(router, mikrotikModule);
    },
    { prefix: "api/v1" },
  );
}
