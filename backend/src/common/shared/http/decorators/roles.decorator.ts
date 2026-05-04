// src/shared/http/decorators/roles.decorator.ts

import { updateRoute } from "./metadata";
import type { UserRole } from "./types";

/**
 * Define quais perfis podem acessar uma rota.
 *
 * Exemplo:
 * @Roles("admin", "manager")
 */
export function Roles(...roles: UserRole[]) {
  return function (target: object, propertyKey: string | symbol): void {
    updateRoute(target.constructor, String(propertyKey), {
      auth: true,
      roles,
    });
  };
}

/**
 * Define que a rota é pública, ou seja, não requer autenticação.
 *
 * Exemplo:
 * @Get("/")
 * @Roles("admin")
 * async listUsers() {
 * return this.usersService.findAll();
 * }
 */
