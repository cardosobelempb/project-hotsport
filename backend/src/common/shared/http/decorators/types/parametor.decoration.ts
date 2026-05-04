/**
 * Decorator para marcar um parâmetro como corpo da requisição.
 * @param target O protótipo do objeto que contém o método decorado. Representa a classe onde o método está definido.
 * @param propertyKey  O nome do método decorado. Representa o nome do método onde o parâmetro está definido.
 * @param index A posição do parâmetro decorado na lista de parâmetros do método. Representa a ordem dos parâmetros no método, começando em 0.
 * @returns Uma função decoradora que loga a posição do parâmetro decorado como corpo da requisição no console.
 */

function Body(target: any, propertyKey: string, index: number) {
  console.log(`Parâmetro body na posição ${index}`);
}

/*
 * Exemplo de uso do decorador Body:
 * class UserController {
 *  createUser(@Body userData: any) {
 *   // Lógica para criar um usuário usando os dados do corpo da requisição
 *   }
 * }
 * // Saída no console:
 * // Parâmetro body na posição 0
 * */
