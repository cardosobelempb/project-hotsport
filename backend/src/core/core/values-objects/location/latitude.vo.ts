import { BadRequestError } from '../../errors'
import { I18nAbstract } from '../../common/abstract'

export class LatitudeVO {
  private readonly _value: number

  private constructor(value: number) {
    this._value = value
  }

  /**
   * Cria um LatitudeVO com validação.
   * @param value Número da latitude
   * @param i18n Instância de tradução (opcional)
   */
  public static create(value: number, i18n?: I18nAbstract): LatitudeVO {
    if (!this.isValid(value)) {
      const message =
        i18n?.t('errors.latitude.invalid', { args: { value } }) ??
        `Invalid latitude: ${value}. Must be between -90 and 90.`
      throw new BadRequestError(message)
    }
    return new LatitudeVO(value)
  }

  /** Verifica se um valor é uma latitude válida */
  public static isValid(value: number): boolean {
    return typeof value === 'number' && value >= -90 && value <= 90
  }

  /** Retorna o valor */
  public get value(): number {
    return this._value
  }

  /** Compara com outro LatitudeVO */
  public equals(other: LatitudeVO): boolean {
    return this._value === other.value
  }

  /** Retorna como string */
  public toString(): string {
    return this._value.toString()
  }
}
