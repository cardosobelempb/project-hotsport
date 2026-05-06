// src/shared/auth/auth.plugin.ts

import { env } from "@/common/infrastructure/env";
import fastifyJwt from "@fastify/jwt";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

export async function authPlugin(app: FastifyInstance) {
  await app.register(fastifyJwt, {
    secret: env.JWT_ACCESS_SECRET,
  });
}

export default fp(authPlugin);
