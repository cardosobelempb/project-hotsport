// src/shared/http/decorators/paginated.decorator.ts

import { updateRoute } from "./metadata";

/**
 * Ativa paginação automática para uma rota.
 *
 * Exemplo:
 * @Paginated()
 */
export function Paginated() {
  return function (target: object, propertyKey: string | symbol): void {
    updateRoute(target.constructor, String(propertyKey), {
      pagination: true,
    });
  };
}

/**
@Get("/")
@Paginated()
async listUsers(request: FastifyRequest) {
  const query = request.query as {
    page: number;
    limit: number;
  };

  return this.usersService.findPaginated(query);
}
*/
