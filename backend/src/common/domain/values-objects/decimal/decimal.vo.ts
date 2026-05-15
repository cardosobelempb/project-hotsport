// src/common/domain/value-objects/decimal.vo.ts

import Decimal from "decimal.js";
import { BadRequestError } from "../../errors/controllers/bad-request.error";
import { BaseVO } from "../base.vo";

export class DecimalVO extends BaseVO<Decimal> {
  private static readonly MAX_INTEGER_DIGITS = 12;
  private static readonly DECIMAL_PLACES = 2;

  private constructor(value: Decimal) {
    super(value);
  }

  public static create(value: string | number): DecimalVO {
    const decimal = new Decimal(value);

    if (!DecimalVO.isValidStatic(decimal)) {
      throw new BadRequestError({
        fieldName: "decimal",
        value: decimal.toString(),
        message: `Invalid decimal: "${value}". Must be a positive number with up to ${DecimalVO.MAX_INTEGER_DIGITS} integer digits and ${DecimalVO.DECIMAL_PLACES} decimal places.`,
      });
    }

    return new DecimalVO(decimal);
  }

  private static isValidStatic(value: Decimal): boolean {
    const strValue = value.toFixed(DecimalVO.DECIMAL_PLACES);
    const [integerPart = ""] = strValue.split(".");
    return value.gt(0) && integerPart.length <= DecimalVO.MAX_INTEGER_DIGITS;
  }

  public isValid(): boolean {
    return DecimalVO.isValidStatic(this.value);
  }

  public static validate(value: string | number): boolean {
    try {
      const decimal = new Decimal(value);
      return DecimalVO.isValidStatic(decimal);
    } catch {
      return false;
    }
  }

  // 💰 Formatação BR
  public formatBRL(): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(this.value));
  }

  // ➕ Operações seguras
  public add(other: DecimalVO): DecimalVO {
    return DecimalVO.create(this.value.plus(other.value).toString());
  }

  public mul(multiplier: number): DecimalVO {
    return DecimalVO.create(this.value.mul(multiplier).toString());
  }

  public toFixed(): string {
    return this.value.toFixed(DecimalVO.DECIMAL_PLACES);
  }

  public toNumber(): number {
    return Number(this.value);
  }
}

/**
 // ✅ HotspotPlan com DecimalVO
const planPrice = DecimalVO.create("29.90");
const tax = DecimalVO.create("0.17");
const finalPrice = planPrice.mul(1.17); // 29.90 * 1.17 = 34.983 ✅ Exato!

console.log(planPrice.formatBRL());     // "R$ 29,90"
console.log(finalPrice.formatBRL());    // "R$ 34,98"
// Usage em entities
const price = DecimalVO.create("123.45");  // R$ 123,45
const host = IpAddressVO.create("192.168.1.1");
const mac = MacAddressVO.create("00-11-22-33-44-55");

// ❌ Sem DecimalVO
const buggy = 29.90 * 1.17; // 34.983000000000004 😱
 */
