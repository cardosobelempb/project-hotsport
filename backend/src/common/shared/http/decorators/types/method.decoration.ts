/**
 * Decorator para definir uma rota GET em um controlador.
 * @param route O caminho da rota GET a ser associada ao método decorado. Deve ser uma string representando o caminho da rota, como "/users" ou "/products/:id".
 * @returns Uma função decoradora que associa a rota GET ao método decorado e loga o caminho da rota no console.
 */
function Get(route: string) {
  return function (target: any, key: string) {
    console.log(`Rota GET: ${route}`);
  };
}

/**
 * Exemplo de uso do decorador Get:
 *
 * class UserController {}
 *
 * class UserController {
 *   @Get("/users")
 */
