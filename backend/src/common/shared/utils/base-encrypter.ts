/**
 * Representa um contrato genérico para serviços de criptografia.
 * Segue o princípio da inversão de dependência (DIP).
 */
export abstract class BaseEncrypter<TPayload = unknown> {
  /**
   * Gera um token ou string criptografada a partir do payload fornecido.
   * A implementação concreta deve definir como o payload é transformado em uma string criptografada.
   * @param payload - Os dados que serão criptografados.
   * @returns Uma string criptografada representando o payload.
   * @throws Erro se a criptografia falhar ou se a configuração for inválida.
   */
  abstract encrypt(payload: TPayload): Promise<string>;
  abstract decrypt(token: string): Promise<TPayload>;
}
