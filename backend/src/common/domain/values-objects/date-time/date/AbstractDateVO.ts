

export abstract class AbstractDateVO {
  protected abstract value: Date

  /** Cria a instância (factory) */
  static create<T extends AbstractDateVO>(this: new (dateString: string) => T, dateString: string): T {
    return new this(dateString)
  }

  /** Retorna a data como string no formato YYYY-MM-DD */
  abstract getValue(): string

  /** Retorna a data como objeto Date */
  abstract getDate(): Date

  /** Valida o formato da data */
  protected abstract validate(dateString: string): Date

  /** Representação da data como string */
  abstract toString(): string

  /** Compara com outro DateVO */
  abstract equals(other: AbstractDateVO): boolean
}
