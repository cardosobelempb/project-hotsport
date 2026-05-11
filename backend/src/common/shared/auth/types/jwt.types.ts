// shared/auth/jwt.types.ts

import { StringValue } from "ms";

export type JwtPayload = {
  sub: string;
  [key: string]: unknown;
};

export interface JwtConfig {
  secretKey: string;
  expiresIn: StringValue | number;
}
