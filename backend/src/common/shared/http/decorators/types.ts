// src/shared/http/types.ts

import type { ZodType } from "zod";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type UserRole = "admin" | "manager" | "support" | "user";

export type RateLimitWindow = "1s" | "1m" | "5m" | "15m" | "1h";

export type RouteDefinition = {
  method: HttpMethod;
  path: string;
  handlerName: string;

  schema?: {
    body?: ZodType;
    params?: ZodType;
    query?: ZodType;
    response?: ZodType;
  };

  docs?: {
    tags?: string[];
    summary?: string;
    description?: string;
  };

  auth?: boolean;

  roles?: UserRole[];

  cache?: {
    ttl: number;
  };

  rateLimit?: {
    max: number;
    window: RateLimitWindow;
  };

  transaction?: boolean;

  pagination?: boolean;
};
