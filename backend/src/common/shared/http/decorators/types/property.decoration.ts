/*
 * Decorator para marcar um campo como obrigatório.
 * @param target O protótipo do objeto que contém o campo decorado.
 * @param propertyKey O nome do campo decorado.
 * @returns Uma função decoradora que loga o nome do campo obrigatório no console.
 */
function Required(target: any, propertyKey: string) {
  console.log(`Campo obrigatório: ${propertyKey}`);
}

/*
 * Exemplo de uso do decorador Required:
 * class User {
 *   @Required
 *   name: string;
 *  *   @Required
 *  email: string;
 * }
 * // Saída no console:
 * // Campo obrigatório: name
 * // Campo obrigatório: email
 */
