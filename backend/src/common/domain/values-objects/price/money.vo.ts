// ============================================================
// src/common/domain/value-objects/money.vo.ts
// Compatível com sua BaseVO atual
// ============================================================

import { BadRequestError } from "../../errors/controllers/bad-request.error";
import { BaseVO } from "../base.vo";

export type MoneyCurrency = "BRL" | "USD" | "EUR";

export interface MoneyValue {
  amount: number;
  currency: MoneyCurrency;
}

/**
 * 💰 MoneyVO - Representa valor monetário com moeda
 */
export class MoneyVO extends BaseVO<MoneyValue> {
  private constructor(value: MoneyValue) {
    super(value);
  }

  public static create(
    amount: number,
    currency: MoneyCurrency = "BRL",
  ): MoneyVO {
    const normalized: MoneyValue = {
      amount: Number(amount),
      currency,
    };

    if (!MoneyVO.isValidStatic(normalized)) {
      throw new BadRequestError({
        fieldName: "money",
        message: `Invalid money value. Amount must be greater than or equal to zero and currency must be valid.`,
      });
    }

    return new MoneyVO(normalized);
  }

  private static isValidStatic(value: MoneyValue): boolean {
    return (
      typeof value.amount === "number" &&
      !Number.isNaN(value.amount) &&
      Number.isFinite(value.amount) &&
      value.amount >= 0 &&
      MoneyVO.isValidCurrency(value.currency)
    );
  }

  public isValid(): boolean {
    return MoneyVO.isValidStatic(this.value);
  }

  public static validate(
    amount: number,
    currency: MoneyCurrency = "BRL",
  ): boolean {
    return MoneyVO.isValidStatic({
      amount: Number(amount),
      currency,
    });
  }

  private static isValidCurrency(currency: string): currency is MoneyCurrency {
    return ["BRL", "USD", "EUR"].includes(currency);
  }

  public get amount(): number {
    return this.value.amount;
  }

  public get currency(): MoneyCurrency {
    return this.value.currency;
  }

  public isZero(): boolean {
    return this.amount === 0;
  }

  public isGreaterThan(other: MoneyVO): boolean {
    this.ensureSameCurrency(other);
    return this.amount > other.amount;
  }

  public isGreaterThanOrEqual(other: MoneyVO): boolean {
    this.ensureSameCurrency(other);
    return this.amount >= other.amount;
  }

  public add(other: MoneyVO): MoneyVO {
    this.ensureSameCurrency(other);

    return MoneyVO.create(this.amount + other.amount, this.currency);
  }

  public subtract(other: MoneyVO): MoneyVO {
    this.ensureSameCurrency(other);

    const result = this.amount - other.amount;

    if (result < 0) {
      throw new BadRequestError({
        fieldName: "money",
        message: "Money subtraction cannot result in a negative amount.",
      });
    }

    return MoneyVO.create(result, this.currency);
  }

  public multiply(multiplier: number): MoneyVO {
    if (!Number.isFinite(multiplier) || multiplier < 0) {
      throw new BadRequestError({
        fieldName: "multiplier",
        message: "Multiplier must be a positive number.",
      });
    }

    return MoneyVO.create(this.amount * multiplier, this.currency);
  }

  public format(locale = "pt-BR"): string {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: this.currency,
    }).format(this.amount);
  }

  private ensureSameCurrency(other: MoneyVO): void {
    if (this.currency !== other.currency) {
      throw new BadRequestError({
        fieldName: "currency",
        value: `${this.currency} != ${other.currency}`,
        message: "Cannot operate with different currencies.",
      });
    }
  }
}
