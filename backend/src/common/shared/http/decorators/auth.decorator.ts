import { getRoutes } from "./metadata";

/**
 * Marca uma rota como protegida.
 *
 * A implementação real da autenticação fica no register-routes.
 * Exemplo:
 * @Auth()
 * async getProtectedResource() {
 *   // lógica para obter recurso protegido
 * }
 */
export function Auth() {
  return function (target: object, propertyKey: string | symbol): void {
    const routes = getRoutes(target.constructor);

    const route = routes.find(
      (item) => item.handlerName === String(propertyKey),
    );

    if (!route) {
      throw new Error(
        `@Auth precisa ser usado junto com um decorator de rota em ${String(propertyKey)}`,
      );
    }

    route.auth = true;
  };
}
