/**
 * Exemplo de uso de decoradores em TypeScript
 *
 * Este código define um decorador de classe `Controller` e um decorador de método `Get`.
 * O decorador `Controller` adiciona um prefixo à classe, enquanto o decorador `Get` mapeia um caminho para um método.
 */
function Controller(prefix: string) {
  return function (constructor: Function) {
    constructor.prototype.prefix = prefix;
  };
}
/**
 * Decorador de método para mapear uma rota GET a um método específico.
 * @param path O caminho da rota GET a ser mapeada.
 * @returns Uma função decoradora que associa o caminho ao método decorado e loga a associação no console.
 */

function Get(path: string) {
  return function (target: any, key: string) {
    console.log(`Mapeando GET ${path} -> ${key}`);
  };
}

/**
 * Exemplo de uso dos decoradores Controller e Get.
 * A classe UserController é decorada com @Controller para definir um prefixo de rota, e o método listar é decorado com @Get para mapear a rota GET.
 * Ao instanciar a classe UserController, o console exibirá as mensagens de mapeamento e criação do controlador.

@Controller("/users")
class UserController {
  @Get("/")
  listar() {
    return ["user1", "user2"];
  }
}
 */
