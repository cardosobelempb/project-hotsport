export class PriceUtils {
  /**
   * Arredonda um número para 2 casas decimais de forma segura
   * Evita problemas de precisão do JS em operações financeiras
   * Ex: 0.1 + 0.2 => 0.30
   */
  private static round(value: number, decimals: number = 2): number {
    const factor = 10 ** decimals
    return Math.round(value * factor) / factor
  }

  /**
   * Formata um número como moeda local
   * @param value - valor numérico
   * @param currency - código da moeda, ex: 'BRL'
   * @param locale - código de localidade, ex: 'pt-BR'
   */
  static format(value: number, currency: string = 'BRL', locale: string = 'pt-BR'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(value)
  }

  /**
   * Aplica um desconto percentual seguro
   * @param price - preço original
   * @param discountPercent - percentual de desconto (0 a 100)
   */
  static applyDiscount(price: number, discountPercent: number): number {
    if (discountPercent < 0 || discountPercent > 100) {
      throw new RangeError('Percentual de desconto deve estar entre 0 e 100')
    }
    return this.round(price * (1 - discountPercent / 100))
  }

  /**
   * Soma múltiplos valores com precisão financeira
   * @param prices - array de números
   */
  static sum(...prices: number[]): number {
    const total = prices.reduce((acc, curr) => acc + curr, 0)
    return this.round(total)
  }

  /**
   * Converte um valor entre moedas usando taxa de câmbio
   * @param price - valor original
   * @param exchangeRate - taxa de câmbio positiva
   */
  static convert(price: number, exchangeRate: number): number {
    if (exchangeRate <= 0) {
      throw new RangeError('Taxa de câmbio deve ser maior que 0')
    }
    return this.round(price * exchangeRate)
  }

  /**
   * Aplica imposto sobre um valor
   * @param price - valor original
   * @param taxPercent - percentual de imposto (>= 0)
   */
  static applyTax(price: number, taxPercent: number): number {
    if (taxPercent < 0) {
      throw new RangeError('Percentual de imposto não pode ser negativo')
    }
    return this.round(price * (1 + taxPercent / 100))
  }

  /**
   * Remove imposto embutido em um valor
   * @param priceWithTax - valor já com imposto
   * @param taxPercent - percentual de imposto aplicado
   */
  static removeTax(priceWithTax: number, taxPercent: number): number {
    if (taxPercent < 0) {
      throw new RangeError('Percentual de imposto não pode ser negativo')
    }
    return this.round(priceWithTax / (1 + taxPercent / 100))
  }
}
