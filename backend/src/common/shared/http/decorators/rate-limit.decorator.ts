// src/shared/http/decorators/rate-limit.decorator.ts

import { updateRoute } from "./metadata";
import type { RateLimitWindow } from "./types";

type RateLimitOptions = {
  max: number;
  window: RateLimitWindow;
};

/**
 * Limita quantidade de chamadas em uma janela de tempo.
 *
 * Exemplo:
 * @RateLimit({ max: 10, window: "1m" })
 */
export function RateLimit(options: RateLimitOptions) {
  return function (target: object, propertyKey: string | symbol): void {
    updateRoute(target.constructor, String(propertyKey), {
      rateLimit: options,
    });
  };
}

/**
 * Define que a rota é pública, ou seja, não requer autenticação.
 *
 * Exemplo:
 * @Get("/")
 * @RateLimit({ max: 10, window: "1m" })
 * async listUsers() {
 * return this.usersService.findAll();
 * }
 */
