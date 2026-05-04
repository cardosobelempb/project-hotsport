// src/@types/fastify.d.ts

import type { UserRole } from "@prisma/client";

declare module "fastify" {
  interface FastifyRequest {
    user?: {
      id: string;
      email: string;
      role: UserRole;
    };
  }
}
