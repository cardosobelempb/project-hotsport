import { BaseI18n } from "../../common/shared/base-I18n";
import { BadRequestError } from "../../errors/controllers/bad-request.error";
import { BaseVO } from "../base.vo";

export class LatitudeVO extends BaseVO<number> {
  protected readonly value: number;

  private constructor(value: number) {
    super(value);
    this.value = value;
  }

  /**
   * Cria um LatitudeVO com validação.
   * @param value Número da latitude
   * @param i18n Instância de tradução (opcional)
   */
  public static create(value: number, i18n?: BaseI18n): LatitudeVO {
    if (!this.isValid(value)) {
      const message =
        i18n?.t("errors.latitude.invalid", { args: { value } }) ??
        `Invalid latitude: ${value}. Must be between -90 and 90.`;
      throw new BadRequestError(message);
    }
    return new LatitudeVO(value);
  }

  public isValid(): boolean {
    return LatitudeVO.isValid(this.value);
  }

  /** Verifica se um valor é uma latitude válida */
  public static isValid(value: number): boolean {
    return typeof value === "number" && value >= -90 && value <= 90;
  }

  /** Compara com outro LatitudeVO */
  public equals(other: LatitudeVO): boolean {
    return this.value === other.value;
  }

  /** Retorna como string */
  public toString(): string {
    return this.value.toString();
  }
}
