// shared/auth/token.types.ts

export type AuthTokenPayload = {
  sub: string;
  email?: string;
  role?: string;
};
