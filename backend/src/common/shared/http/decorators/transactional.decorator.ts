// src/shared/http/decorators/transactional.decorator.ts

import { updateRoute } from "./metadata";

/**
 * Marca uma rota para executar dentro de transação.
 *
 * Exemplo:
 * @Transactional()
 */
export function Transactional() {
  return function (target: object, propertyKey: string | symbol): void {
    updateRoute(target.constructor, String(propertyKey), {
      transaction: true,
    });
  };
}

/**
 * Define que a rota é pública, ou seja, não requer autenticação.
 *@Post("/")
    @Transactional()
    async createOrder(request: FastifyRequest) {
      return this.ordersService.create(request.body);
  }
 * Exemplo:
 * @Get("/")
 * @Transactional()
 * async listUsers() {
 * return this.usersService.findAll();
 * }
 */
