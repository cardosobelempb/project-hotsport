/**
 * Representa um contrato genérico para serviços de criptografia.
 * Segue o princípio da inversão de dependência (DIP).
 */
export abstract class Encrypter<TInput = unknown> {
  /**
   * Executa a criptografia de um dado de entrada.
   *
   * @param data - Dados a serem criptografados
   * @returns Promise contendo o resultado criptografado
   */
  abstract encrypt(data: TInput): Promise<string>;
}
