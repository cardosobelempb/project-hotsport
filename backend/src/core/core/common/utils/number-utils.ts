/**
 * Utilitário para manipulação e formatação de números.
 * - Seguro
 * - Reutilizável
 * - Coberto contra edge-cases
 */
export class NumberUtils {
  private constructor() {}

  // ---------------------------------------------------------------------------
  // Helpers internos
  // ---------------------------------------------------------------------------

  /** Verifica se um valor é um número finito (proteção contra NaN e Infinity). */
  private static isValidNumber(value: any): value is number {
    return typeof value === 'number' && Number.isFinite(value)
  }

  /** Garante que um número inválido se torne zero (fallback seguro). */
  private static ensureNumber(value: any): number {
    return this.isValidNumber(value) ? value : 0
  }

  // ---------------------------------------------------------------------------
  // Formatação
  // ---------------------------------------------------------------------------

  /**
   * Formata para sempre ter duas casas decimais.
   * - Usa `toFixed(2)` para evitar inconsistências.
   */
  static formatNumberWithDecimal(num: number): string {
    num = this.ensureNumber(num)
    return num.toFixed(2)
  }

  /**
   * Formata um número como moeda usando `Intl.NumberFormat`.
   * - Locale automático
   * - Currency dinâmica
   */
  static formatCurrency(
    num: number,
    locale: string = 'pt-BR',
    currency: string = 'BRL',
  ): string {
    num = this.ensureNumber(num)

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num)
  }

  /**
   * Converte uma string de moeda para número.
   * Ex: "R$ 1.234,56" → 1234.56
   */
  static parseCurrency(str: string): number {
    if (!str) return 0

    const cleaned = str
      .replace(/[^\d,-]/g, '') // remove letras/símbolos
      .replace(/\.(?=\d{3,})/g, '') // remove separadores de milhar
      .replace(',', '.') // transforma decimal BR em decimal US

    const num = parseFloat(cleaned)
    return this.ensureNumber(num)
  }

  /**
   * Formata para percentual com 2 casas: 0.123 → "12.30%"
   */
  static formatPercentage(num: number): string {
    num = this.ensureNumber(num)
    return `${(num * 100).toFixed(2)}%`
  }

  // ---------------------------------------------------------------------------
  // Manipulação numérica
  // ---------------------------------------------------------------------------

  /**
   * Arredonda para N casas decimais.
   */
  static roundToDecimalPlaces(num: number, decimalPlaces: number): number {
    num = this.ensureNumber(num)
    decimalPlaces = Math.max(0, decimalPlaces)

    const factor = Math.pow(10, decimalPlaces)
    return Math.round(num * factor) / factor
  }

  /**
   * Calcula imposto: Ex: (100, 15) → 15
   */
  static calculateTax(amount: number, taxRate: number): number {
    amount = this.ensureNumber(amount)
    taxRate = this.ensureNumber(taxRate)

    return (amount * taxRate) / 100
  }

  // ---------------------------------------------------------------------------
  // Validações
  // ---------------------------------------------------------------------------

  static isPositive(num: number): boolean {
    return this.ensureNumber(num) > 0
  }

  static isNegative(num: number): boolean {
    return this.ensureNumber(num) < 0
  }

  static isInteger(num: number): boolean {
    return Number.isInteger(num)
  }

  // ---------------------------------------------------------------------------
  // Formatação específica
  // ---------------------------------------------------------------------------

  /**
   * Formata um telefone brasileiro no padrão:
   * "11987654321" → "(11) 98765-4321"
   */
  static formatPhoneNumber(phone: string): string {
    if (!phone) return ''

    const digits = phone.replace(/\D/g, '')
    const match = digits.match(/^(\d{2})(\d{5})(\d{4})$/)

    return match ? `(${match[1]}) ${match[2]}-${match[3]}` : phone
  }
}
