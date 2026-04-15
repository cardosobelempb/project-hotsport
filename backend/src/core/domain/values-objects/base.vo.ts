/**
 * 🧱 Classe base abstrata para todos os Value Objects do domínio.
 *
 * Define comportamento padrão e garante imutabilidade.
 *
 * Benefícios:
 *  - Reuso de lógica comum entre VOs
 *  - Consistência entre implementações
 *  - Aplicação de princípios SOLID (especialmente SRP e LSP)
 */
export abstract class BaseVO<T> {
  protected readonly value: T;

  protected constructor(value: T) {
    // Garante imutabilidade e validação centralizada
    this.value = value;
    Object.freeze(value);
  }

  /**
   * 🔒 Retorna o valor encapsulado
   */
  public getValue(): T {
    return this.value;
  }

  /**
   * 🔁 Compara dois Value Objects pelo valor interno
   * @param other - Outro Value Object
   * @returns true se forem equivalentes
   */
  public equals(other?: BaseVO<T> | null): boolean {
    if (!other) return false;
    if (other.constructor !== this.constructor) return false;
    return JSON.stringify(this.value) === JSON.stringify(other.value);
  }

  /**
   * 🧪 Método abstrato para validar o valor.
   * Deve ser implementado por cada VO concreto.
   */
  public abstract isValid(): boolean;

  /**
   * 🪶 Representação string do valor (para logs, JSON, etc.)
   */
  public toString(): string {
    return String(this.value);
  }
}
