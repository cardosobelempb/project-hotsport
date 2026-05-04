// shared/auth/fastify-jwt.service.ts

import type { FastifyJWTOptions } from "@fastify/jwt";
import type { FastifyInstance } from "fastify";
import { AuthTokenPayload } from "./types/token.types";

export class FastifyJwtService<
  TPayload extends AuthTokenPayload = AuthTokenPayload,
> {
  constructor(
    private readonly app: FastifyInstance,
    private readonly options?: Partial<FastifyJWTOptions["sign"]>,
  ) {}

  async sign(payload: TPayload): Promise<string> {
    return this.app.jwt.sign(payload, this.options);
  }

  async verify(token: string): Promise<TPayload> {
    return this.app.jwt.verify<TPayload>(token);
  }
}
