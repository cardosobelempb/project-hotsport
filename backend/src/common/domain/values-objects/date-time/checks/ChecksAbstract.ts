let dayjs: any
try {
  dayjs = require('dayjs')
} catch {
  dayjs = null
}

/**
 * Classe abstrata para checks de data.
 * Funciona com Dayjs (se disponível) ou com Date nativo.
 */
export abstract class ChecksAbstract {
  protected readonly value: Date

  protected constructor(input: Date | string) {
    if (!input) throw new Error('Date is required')

    if (dayjs) {
      const parsed = dayjs(input)
      if (!parsed.isValid()) throw new Error('Invalid date.')
      this.value = parsed.startOf('day').toDate()
    } else {
      const parsed = new Date(input)
      if (isNaN(parsed.getTime())) throw new Error('Invalid date.')
      parsed.setHours(0, 0, 0, 0) // normalize to start of day
      this.value = parsed
    }
  }

  /** Compara se a data é igual a outra */
  public isSame(other: ChecksAbstract): boolean {
    if (dayjs) return dayjs(this.value).isSame(dayjs(other.value), 'day')
    return this.value.getTime() === other.value.getTime()
  }

  /** Compara se a data é anterior a outra */
  public isBefore(other: ChecksAbstract): boolean {
    if (dayjs) return dayjs(this.value).isBefore(dayjs(other.value), 'day')
    return this.value.getTime() < other.value.getTime()
  }

  /** Compara se a data é posterior a outra */
  public isAfter(other: ChecksAbstract): boolean {
    if (dayjs) return dayjs(this.value).isAfter(dayjs(other.value), 'day')
    return this.value.getTime() > other.value.getTime()
  }

  /** Retorna como objeto Date */
  public toDate(): Date {
    return new Date(this.value.getTime())
  }

  /** Retorna a data formatada (YYYY-MM-DD padrão) */
  public format(format: string = 'YYYY-MM-DD'): string {
    if (dayjs) return dayjs(this.value).format(format)

    const yyyy = this.value.getFullYear()
    const mm = String(this.value.getMonth() + 1).padStart(2, '0')
    const dd = String(this.value.getDate()).padStart(2, '0')

    if (format === 'YYYY-MM-DD') return `${yyyy}-${mm}-${dd}`

    // suporte básico a alguns formatos comuns
    return format
      .replace('YYYY', String(yyyy))
      .replace('MM', mm)
      .replace('DD', dd)
  }
}
