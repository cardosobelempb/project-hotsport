// src/shared/http/decorators/cache.decorator.ts

import { updateRoute } from "./metadata";

/**
 * Define cache em segundos para uma rota.
 *
 * Exemplo:
 * @Cache(60)
 */
export function Cache(ttl: number) {
  return function (target: object, propertyKey: string | symbol): void {
    updateRoute(target.constructor, String(propertyKey), {
      cache: {
        ttl,
      },
    });
  };
}

/**
 * Define que a rota é pública, ou seja, não requer autenticação.
 *
 * Exemplo:
 * @Get("/")
 * @Cache(60)
 * async listUsers() {
 * return this.usersService.findAll();
 * }
 */
