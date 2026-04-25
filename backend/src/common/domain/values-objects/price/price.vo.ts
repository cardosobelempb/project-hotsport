import { BadRequestError } from "../../errors/controllers/bad-request.error";
import { BaseVO } from "../base.vo";
import { messages } from "../locales/locales";

/** Idiomas suportados para formatação monetária */
export type SupportedLang = "pt" | "en";

/** Configurações opcionais para criação e formatação de preços */
export interface PriceOptions {
  lang?: SupportedLang;
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  minValue?: number;
}

/**
 * ✅ Value Object que representa um preço monetário.
 * Garante consistência, imutabilidade e formatação internacional.
 */
export class PriceVO extends BaseVO<number> {
  private static readonly DEFAULT_LANG: SupportedLang = "en";
  private static readonly DEFAULT_CURRENCY = "USD";
  private static readonly DEFAULT_MIN_VALUE = 0;

  private readonly currency: string;
  private readonly lang: SupportedLang;

  /** 🔒 Construtor privado — use `create()` para instanciar. */
  private constructor(value: number, currency: string, lang: SupportedLang) {
    super(value);
    this.currency = currency;
    this.lang = lang;
  }

  // ============================================
  // 🏗️ Fábrica estática (principal ponto de entrada)
  // ============================================

  /**
   * Cria uma instância de PriceVO com validação completa.
   * Aceita valor numérico ou string formatada (ex: "R$ 10,00").
   * @throws BadRequestError se o valor for inválido.
   */
  public static create(
    input: string | number,
    options: PriceOptions = {},
  ): PriceVO {
    const {
      lang = this.DEFAULT_LANG,
      currency = this.DEFAULT_CURRENCY,
      minValue = this.DEFAULT_MIN_VALUE,
    } = options;

    const msg = messages[lang] ?? messages[this.DEFAULT_LANG];

    const numericValue = this.parseValue(input, msg);

    if (numericValue < minValue) {
      throw new BadRequestError(
        msg.PRICE_NEGATIVE ??
          `Price must be greater than or equal to ${minValue}.`,
      );
    }

    if (!this.isCurrencySupported(currency)) {
      throw new BadRequestError(
        msg.PRICE_UNSUPPORTED_CURRENCY?.replace("{currency}", currency) ??
          `Unsupported currency: ${currency}`,
      );
    }

    return new PriceVO(numericValue, currency, lang);
  }

  // ============================================
  // 🧮 Métodos de instância
  // ============================================

  /** Retorna o valor numérico puro (sem formatação). */
  public getValue(): number {
    return this.value;
  }

  /** Retorna a moeda associada (ex: 'USD', 'BRL'). */
  public getCurrency(): string {
    return this.currency;
  }

  /** Retorna o idioma associado. */
  public getLang(): SupportedLang {
    return this.lang;
  }

  /** Compara se dois preços são equivalentes (valor e moeda). */
  public equals(other?: BaseVO<number> | null): boolean {
    if (!other || !(other instanceof PriceVO)) return false;
    return this.value === other.value && this.currency === other.currency;
  }

  /** Soma dois PriceVO (mesma moeda obrigatória). */
  public add(other: PriceVO): PriceVO {
    this.ensureSameCurrency(other);
    return new PriceVO(this.value + other.value, this.currency, this.lang);
  }

  /** Subtrai outro PriceVO (mesma moeda obrigatória). */
  public subtract(other: PriceVO): PriceVO {
    this.ensureSameCurrency(other);
    return new PriceVO(this.value - other.value, this.currency, this.lang);
  }

  /** Formata o preço com base em idioma, moeda e precisão. */
  public format(options: PriceOptions = {}): string {
    const {
      lang = this.lang,
      currency = this.currency,
      minimumFractionDigits = 2,
      maximumFractionDigits = 2,
    } = options;

    return new Intl.NumberFormat(lang === "pt" ? "pt-BR" : "en-US", {
      style: "currency",
      currency,
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(this.value);
  }

  /** Representação textual formatada (ex: "$10.00" ou "R$ 10,00"). */
  public toString(): string {
    return this.format();
  }

  public isValid(): boolean {
    return (
      typeof this.value === "number" &&
      !isNaN(this.value) &&
      this.value >= 0 &&
      typeof this.currency === "string" &&
      this.currency.length > 0 &&
      PriceVO["isCurrencySupported"](this.currency) &&
      (this.lang === "pt" || this.lang === "en")
    );
  }

  // ============================================
  // 🧩 Métodos utilitários privados
  // ============================================

  /** Valida se uma moeda é suportada pela API Intl. */
  private static isCurrencySupported(currency: string): boolean {
    try {
      new Intl.NumberFormat("en-US", { style: "currency", currency }).format(1);
      return true;
    } catch {
      return false;
    }
  }

  /** Garante que duas moedas são iguais antes de somar/subtrair. */
  private ensureSameCurrency(other: PriceVO): void {
    if (this.currency !== other.currency) {
      throw new BadRequestError(
        `Currency mismatch: cannot operate ${this.currency} with ${other.currency}.`,
      );
    }
  }

  /** Faz parsing e validação de string/number para número. */
  private static parseValue(
    input: string | number,
    msg: Record<string, string>,
  ): number {
    if (input === null || input === undefined || input === "") {
      throw new BadRequestError(msg.EMPTY ?? "Price cannot be empty.");
    }

    let numericValue: number;
    if (typeof input === "string") {
      // Remove símbolos, substitui vírgula por ponto e elimina múltiplos pontos
      const cleaned = input
        .replace(/[^\d,.-]/g, "")
        .replace(",", ".")
        .replace(/(\..*)\./g, "$1");

      numericValue = parseFloat(cleaned);
    } else {
      numericValue = input;
    }

    if (isNaN(numericValue)) {
      throw new BadRequestError(msg.PRICE_INVALID ?? "Invalid price value.");
    }

    return numericValue;
  }
}

/**
 🧪 Exemplo Prático
 // ✅ Criação simples
const price1 = PriceVO.create(199.9, { lang: 'pt', currency: 'BRL' })
console.log(price1.toString()) // "R$ 199,90"

// ✅ Criação a partir de string
const price2 = PriceVO.create('€ 20,50', { lang: 'en', currency: 'EUR' })
console.log(price2.format()) // "€20.50"

// ✅ Soma de valores
const total = price1.add(PriceVO.create(50, { currency: 'BRL' }))
console.log(total.toString()) // "R$ 249,90"

// ❌ Moedas diferentes (erro)
try {
  price1.add(PriceVO.create(10, { currency: 'USD' }))
} catch (e) {
  console.error(e.message) // "Currency mismatch: cannot operate BRL with USD."
}

 */
