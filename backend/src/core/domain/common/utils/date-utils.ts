/**
 * Utilitário de manipulação e formatação de datas.
 * - Padronizado
 * - Seguro
 * - Reutilizável
 */
export class DateUtils {
  private constructor() {}

  // ---------------------------------------------------------------------------
  // Helpers internos
  // ---------------------------------------------------------------------------

  /** Valida se o valor é uma instância Date válida */
  private static isDateInstance(date: any): date is Date {
    return date instanceof Date && !isNaN(date.getTime())
  }

  /** Forma padronizada de extrair Y/M/D */
  private static extractYMD(date: Date) {
    return {
      day: date.getDate(),
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    }
  }

  /** Formata com máscara (DD/MM/YYYY, MM/DD/YYYY, etc.) */
  private static formatWithMask(
    date: Date,
    mask: string,
  ): string {
    if (!this.isDateInstance(date)) return ''

    const { day, month, year } = this.extractYMD(date)
    return mask
      .replace('DD', String(day).padStart(2, '0'))
      .replace('MM', String(month).padStart(2, '0'))
      .replace('YYYY', String(year))
  }

  // ---------------------------------------------------------------------------
  // Validação
  // ---------------------------------------------------------------------------

  /**
   * Retorna true se a string ou Date representa uma data válida.
   */
  static isValidDate(date: string | Date): boolean {
    return this.isDateInstance(new Date(date))
  }

  // ---------------------------------------------------------------------------
  // Formatação
  // ---------------------------------------------------------------------------

  /** Formato DD/MM/YYYY */
  static formatDate(date: Date): string {
    return this.formatWithMask(date, 'DD/MM/YYYY')
  }

  /** Formato YYYY-MM-DD (ISO) */
  static formatDateISO(date: Date): string | undefined {
    return this.isDateInstance(date)
      ? date.toISOString().split('T')[0]
      : ''
  }

  /** Formato MM/DD/YYYY (US) */
  static formatDateUS(date: Date): string {
    return this.formatWithMask(date, 'MM/DD/YYYY')
  }

  /**
   * Formata usando locale e opções customizadas.
   */
  static formatWithLocale(
    date: Date,
    locale = 'pt-BR',
    options?: Intl.DateTimeFormatOptions,
  ): string {
    if (!this.isDateInstance(date)) return ''
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      ...options,
    }).format(date)
  }

  /** Formatação utilizada em textos de blog */
  static formatDateForBlog(dateString: string, prefix?: string): string {
    const date = new Date(dateString)
    const base = this.formatDate(date)
    return prefix ? `${prefix} ${base}` : base
  }

  // ---------------------------------------------------------------------------
  // Parsing
  // ---------------------------------------------------------------------------

  /**
   * Converte "DD/MM/YYYY" → Date
   * - Valida números
   * - Protege contra NaN
   * - Retorna null em caso de data inválida
   */
  static parseDate(dateStr: string): Date | null {
    if (!dateStr) return null

    const parts = dateStr.split('/')
    if (parts.length !== 3) return null

    const [dayStr, monthStr, yearStr] = parts

    // Converte os valores e valida imediatamente
    const day = Number(dayStr)
    const month = Number(monthStr)
    const year = Number(yearStr)

    // Rejeita NaN e valores fora dos ranges normais
    if (
      !Number.isInteger(day) ||
      !Number.isInteger(month) ||
      !Number.isInteger(year) ||
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > 31
    ) {
      return null
    }

    // Constrói a data real
    const date = new Date(year, month - 1, day)

    // Checa se o JavaScript não quebrou a data
    return this.isDateInstance(date) ? date : null
  }


  // ---------------------------------------------------------------------------
  // Comparações simples
  // ---------------------------------------------------------------------------

  static isPast(date: Date): boolean {
    return this.isDateInstance(date) && date.getTime() < Date.now()
  }

  static isFuture(date: Date): boolean {
    return this.isDateInstance(date) && date.getTime() > Date.now()
  }

  static isSameDay(a: Date, b: Date): boolean {
    if (!this.isDateInstance(a) || !this.isDateInstance(b)) return false

    return (
      a.getDate() === b.getDate() &&
      a.getMonth() === b.getMonth() &&
      a.getFullYear() === b.getFullYear()
    )
  }

  static isBetween(date: Date, start: Date, end: Date): boolean {
    if (![date, start, end].every(d => this.isDateInstance(d))) return false

    const t = date.getTime()
    return t >= start.getTime() && t <= end.getTime()
  }

  // ---------------------------------------------------------------------------
  // Manipulação
  // ---------------------------------------------------------------------------

  static addDays(date: Date, days: number): Date {
    const clone = new Date(date)
    clone.setDate(clone.getDate() + days)
    return clone
  }

  static subtractDays(date: Date, days: number): Date {
    return this.addDays(date, -days)
  }

  static diffInDays(a: Date, b: Date): number {
    if (!this.isDateInstance(a) || !this.isDateInstance(b)) return 0
    const diff = Math.abs(a.getTime() - b.getTime())
    return Math.floor(diff / 86_400_000)
  }

  static nowInTimezone(timeZone: string): string {
    return new Date().toLocaleString('en-US', { timeZone })
  }

  // ---------------------------------------------------------------------------
  // Datas relativas
  // ---------------------------------------------------------------------------

  static convertMsToReadable(ms: number): string {
    const s = Math.floor((ms / 1000) % 60)
    const m = Math.floor((ms / 60000) % 60)
    const h = Math.floor((ms / 3600000) % 24)
    const d = Math.floor(ms / 86400000)

    return [
      d ? `${d}d` : '',
      h ? `${h}h` : '',
      m ? `${m}m` : '',
      s ? `${s}s` : '',
    ]
      .filter(Boolean)
      .join(' ')
  }

  static getRelativeTimeFromNow(date: Date, locale = 'pt-BR'): string {
    if (!this.isDateInstance(date)) return ''

    const now = Date.now()
    const diff = date.getTime() - now
    const abs = Math.abs(diff)

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
    const units: [Intl.RelativeTimeFormatUnit, number][] = [
      ['year', 365 * 86400000],
      ['month', 30 * 86400000],
      ['week', 7 * 86400000],
      ['day', 86400000],
      ['hour', 3600000],
      ['minute', 60000],
      ['second', 1000],
    ]

    for (const [unit, size] of units) {
      if (abs >= size) {
        return rtf.format(Math.round(diff / size), unit)
      }
    }
    return rtf.format(0, 'second')
  }

  // ---------------------------------------------------------------------------
  // Construção de calendários
  // ---------------------------------------------------------------------------

  static generateMonthlyCalendar(
    year: number,
    month: number,
    startOnMonday = false,
  ): Date[][] {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    const calendar: Date[][] = []
    let week: Date[] = []

    const shift = startOnMonday ? 6 : 0
    const firstWeekday = (firstDay.getDay() + shift) % 7

    // Preenche espaços vazios da primeira semana
    for (let i = 0; i < firstWeekday; i++) {
      week.push(new Date(NaN))
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      week.push(new Date(year, month, d))
      if (week.length === 7) {
        calendar.push(week)
        week = []
      }
    }

    // Última semana incompleta
    if (week.length) {
      while (week.length < 7) week.push(new Date(NaN))
      calendar.push(week)
    }

    return calendar
  }

  static generateWeeks(startDate: Date, numberOfWeeks: number): Date[][] {
    const weeks: Date[][] = []
    const cursor = new Date(startDate)
    cursor.setDate(cursor.getDate() - cursor.getDay()) // normaliza ao domingo

    for (let i = 0; i < numberOfWeeks; i++) {
      const week: Date[] = []
      for (let d = 0; d < 7; d++) {
        week.push(new Date(cursor))
        cursor.setDate(cursor.getDate() + 1)
      }
      weeks.push(week)
    }

    return weeks
  }

  // ---------------------------------------------------------------------------
  // Feriados Brasileiros
  // ---------------------------------------------------------------------------

  static getBrazilianHolidays(year: number): Date[] {
    const holidays: Date[] = [
      new Date(year, 0, 1),
      new Date(year, 3, 21),
      new Date(year, 4, 1),
      new Date(year, 8, 7),
      new Date(year, 9, 12),
      new Date(year, 10, 2),
      new Date(year, 10, 15),
      new Date(year, 11, 25),
    ]

    const easter = this.calculateEaster(year)
    const carnival = this.addDays(easter, -47)
    const goodFriday = this.addDays(easter, -2)
    const corpusChristi = this.addDays(easter, 60)

    holidays.push(carnival, goodFriday, easter, corpusChristi)

    return holidays
  }

  /** Algoritmo de Gauss para cálculo da Páscoa */
  static calculateEaster(year: number): Date {
    const f = Math.floor
    const G = year % 19
    const C = f(year / 100)
    const H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30
    const I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11))
    const J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7
    const L = I - J
    const month = 3 + f((L + 40) / 44) - 1
    const day = L + 28 - 31 * f(month / 4)
    return new Date(year, month, day)
  }

  static isHoliday(date: Date): boolean {
    return this.getBrazilianHolidays(date.getFullYear()).some(h =>
      this.isSameDay(h, date),
    )
  }
}
