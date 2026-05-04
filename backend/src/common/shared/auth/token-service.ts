// shared/auth/token-service.ts

export abstract class TokenService<TPayload = unknown> {
  abstract sign(payload: TPayload): Promise<string>;
  abstract verify(token: string): Promise<TPayload>;
}
