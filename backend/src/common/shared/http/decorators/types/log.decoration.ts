/**
 * Decorador para logar o nome do método decorado.
 * @returns Uma função decoradora que loga o nome do método decorado.
 */

function Log() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      console.log(`Chamando ${propertyKey} com`, args);

      const result = originalMethod.apply(this, args);

      console.log(`Resultado:`, result);

      return result;
    };
  };
}

/**
 * Exemplo de uso do decorador Log:
 *
 * class Example {
 *   @Log()
 *   sum(a: number, b: number): number {
 *     return a + b;
 *   }
 * }
 *
 * const example = new Example();
 * example.sum(2, 3);
 * // Saída no console:
 * // Chamando sum com [2, 3]
 * // Resultado: 5
 */
