import { addRoute } from "./metadata";
import type { HttpMethod } from "./types";

type RouteDocs = {
  tags?: string[];
  summary?: string;
  description?: string;
};

/**
 * Cria um decorator de rota para o método HTTP especificado.
 * @method O método HTTP para o qual a rota será criada (GET, POST, PUT, PATCH, DELETE).
 * @returns
 * Um decorator de método que pode ser usado para definir rotas em um controller.
 *
 * Exemplo de uso:
 * @Get("/users")
 * async getUsers() {
 *   // lógica para obter usuários
 * }
 *
 */

function createRouteDecorator(method: HttpMethod) {
  return function (path: string = "", docs?: RouteDocs) {
    return function (target: object, propertyKey: string | symbol): void {
      addRoute(target.constructor, {
        method,
        path,
        handlerName: String(propertyKey),
        ...(docs ? { docs } : {}),
      });
    };
  };
}

export const Get = createRouteDecorator("GET");
export const Post = createRouteDecorator("POST");
export const Put = createRouteDecorator("PUT");
export const Patch = createRouteDecorator("PATCH");
export const Delete = createRouteDecorator("DELETE");
