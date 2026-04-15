import { BadRequestError } from "../../errors/controllers/BadRequestError";
import { BaseVO } from "../base.vo";

export class LongitudeVO extends BaseVO<number> {
  protected readonly value: number;

  constructor(value: number) {
    super(value);
    if (!LongitudeVO.isValid(value)) {
      throw new BadRequestError(
        `Invalid longitude: ${value}. Must be between -180 and 180.`,
      );
    }
    this.value = value;
  }

  public static isValid(value: number): boolean {
    return value >= -180 && value <= 180;
  }

  public isValid(): boolean {
    return LongitudeVO.isValid(this.value);
  }

  public toString(): string {
    return this.value.toString();
  }

  /** Compara com outro LongitudeVO */
  public equals(other: LongitudeVO): boolean {
    return this.value === other.value;
  }
}
