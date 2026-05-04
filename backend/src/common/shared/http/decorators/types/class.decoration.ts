/**
 * Decorator de classe para marcar uma classe como um controlador.
 * @param path O caminho associado ao controlador, usado para fins de roteamento e organização.
 * @returns Uma função decoradora que marca a classe como um controlador e loga o caminho associado a ele.
 */
function Controller(path: string) {
  return function (constructor: Function) {
    console.log(`Controller criado: ${path}`);
  };
}

/**
 * Exemplo de uso do decorador Controller:
 *
 * @Controller("/users")
 * class UserController {}
 *
 * // Saída no console:
 * // Controller criado: /users
 */
