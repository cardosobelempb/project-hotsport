// shared/auth/token.types.ts

export type AccessTokenPayload = {
  sub: string;
  email: string;
  memberships: Array<{
    tenantId: string;
    organizationId: string | null;
    role: string;
  }>;
};

export type RefreshTokenPayload = {
  sub: string;
  sessionId: string;
};

export type SessionTokenPayload = {
  sub: string;
  // sessionToken: string;
};
