import { BadRequestError } from '../../errors'

export class LongitudeVO {
  private readonly _value: number

  constructor(value: number) {
    if (!LongitudeVO.isValid(value)) {
      throw new BadRequestError(
        `Invalid longitude: ${value}. Must be between -180 and 180.`,
      )
    }
    this._value = value
  }

  public static isValid(value: number): boolean {
    return value >= -180 && value <= 180
  }

  public get value(): number {
    return this._value
  }

  public toString(): string {
    return this._value.toString()
  }

  /** Compara com outro LongitudeVO */
  public equals(other: LongitudeVO): boolean {
    return this._value === other.value
  }
}
