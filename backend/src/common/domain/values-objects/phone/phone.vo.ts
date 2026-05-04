import { BadRequestError } from "../../errors/controllers/bad-request.error";
import { BaseVO } from "../base.vo";

export interface PhoneValidationOptions {
  minLength?: number;
  maxLength?: number;
}

/**
 * ✅ Value Object de Telefone (Brasil)
 * - Aceita `undefined`, `null` ou string vazia e trata internamente
 * - Valida DDD, tamanho e formato
 * - Imutável e seguro
 */
export class PhoneVO extends BaseVO<string> {
  private static readonly VALID_DDDS = [
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "19",
    "21",
    "22",
    "24",
    "27",
    "28",
    "31",
    "32",
    "33",
    "34",
    "35",
    "37",
    "38",
    "41",
    "42",
    "43",
    "44",
    "45",
    "46",
    "47",
    "48",
    "49",
    "51",
    "53",
    "54",
    "55",
    "61",
    "62",
    "63",
    "64",
    "65",
    "66",
    "67",
    "68",
    "69",
    "71",
    "73",
    "74",
    "75",
    "77",
    "79",
    "81",
    "82",
    "83",
    "84",
    "85",
    "86",
    "87",
    "88",
    "89",
    "91",
    "92",
    "93",
    "94",
    "95",
    "96",
    "97",
    "98",
    "99",
  ];

  private static readonly DEFAULT_MIN_LENGTH = 10;
  private static readonly DEFAULT_MAX_LENGTH = 11;

  protected readonly value: string;

  /** Construtor privado — use o método de fábrica `create()` */
  private constructor(phone: string) {
    super(phone);
    this.value = PhoneVO.clean(phone);
  }

  // ==================================
  // 🏗️ Fábrica segura (create)
  // ==================================
  public static create(
    phone?: string | null,
    options: PhoneValidationOptions = {},
  ): PhoneVO {
    if (phone == null || phone.trim() === "") {
      throw new BadRequestError({
        fieldName: "phone",
        message: "Phone number cannot be empty.",
      });
    }

    const cleaned = PhoneVO.clean(phone);
    const {
      minLength = this.DEFAULT_MIN_LENGTH,
      maxLength = this.DEFAULT_MAX_LENGTH,
    } = options;

    PhoneVO.validate(cleaned, minLength, maxLength);
    return new PhoneVO(cleaned);
  }

  // ==================================
  // 🧩 Métodos de instância
  // ==================================

  public getValue(): string {
    return this.value;
  }

  public equals(other?: BaseVO<string> | null): boolean {
    return !!other && this.value === (other as PhoneVO).value;
  }

  public isValid(): boolean {
    return PhoneVO.isValid(this.value);
  }

  public format(): string {
    const ddd = this.value.slice(0, 2);
    const isMobile = this.value.length === 11;
    const firstPart = isMobile
      ? this.value.slice(2, 7)
      : this.value.slice(2, 6);
    const secondPart = isMobile ? this.value.slice(7) : this.value.slice(6);
    return `(${ddd}) ${firstPart}-${secondPart}`;
  }

  public toString(): string {
    return this.format();
  }

  // ==================================
  // 🧱 Métodos utilitários estáticos
  // ==================================

  private static clean(phone: string): string {
    return phone.replace(/\D/g, "");
  }

  private static validate(cleaned: string, min: number, max: number): void {
    if (!/^\d+$/.test(cleaned)) {
      throw new BadRequestError({
        fieldName: "phone",
        value: cleaned,
        message: "Phone number must contain only digits.",
      });
    }

    if (cleaned.length < min) {
      throw new BadRequestError({
        fieldName: "phone",
        value: cleaned,
        message: `Phone number must have at least ${min} digits.`,
      });
    }

    if (cleaned.length > max) {
      throw new BadRequestError({
        fieldName: "phone",
        value: cleaned,
        message: `Phone number must have at most ${max} digits.`,
      });
    }

    const ddd = cleaned.slice(0, 2);
    const number = cleaned.slice(2);

    if (!PhoneVO.VALID_DDDS.includes(ddd)) {
      throw new BadRequestError({
        fieldName: "phone",
        value: cleaned,
        message: `Invalid DDD: ${ddd}. Must be one of ${PhoneVO.VALID_DDDS.join(
          ", ",
        )}.`,
      });
    }

    if (number.length === 9 && number[0] !== "9") {
      throw new BadRequestError({
        fieldName: "phone",
        value: cleaned,
        message: `Invalid mobile phone number: 9-digit numbers must start with 9.`,
      });
    }

    if (number.length === 8 && !["2", "3", "4", "5"].includes(number[0]!)) {
      throw new BadRequestError({
        fieldName: "phone",
        value: cleaned,
        message: `Invalid landline phone number: 8-digit numbers must start with 2, 3, 4 or 5.`,
      });
    }
  }

  /** Verifica validade sem lançar exceção */
  public static isValid(phone?: string | null): boolean {
    if (!phone || phone.trim() === "") return false;
    try {
      const cleaned = PhoneVO.clean(phone);
      PhoneVO.validate(
        cleaned,
        this.DEFAULT_MIN_LENGTH,
        this.DEFAULT_MAX_LENGTH,
      );
      return true;
    } catch {
      return false;
    }
  }
}
