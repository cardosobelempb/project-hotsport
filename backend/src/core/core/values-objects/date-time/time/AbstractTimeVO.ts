

export abstract class AbstractTimeVO {
  protected abstract value: string

  /** Cria a instância (factory) */
  static create<T extends AbstractTimeVO>(this: new (time: string) => T, time: string): T {
    return new this(time)
  }

  /** Retorna o valor como string HH:mm */
  abstract getValue(): string

  /** Retorna apenas as horas */
  abstract getHours(): number

  /** Retorna apenas os minutos */
  abstract getMinutes(): number

  /** Valida o formato do tempo */
  protected abstract validate(time: string): string

  /** Retorna uma representação em string */
  abstract toString(): string

  /** Compara com outro TimeVO */
  abstract equals(other: AbstractTimeVO): boolean
}
