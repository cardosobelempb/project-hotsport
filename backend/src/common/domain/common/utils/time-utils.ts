export class TimeUtils {
  private constructor() {}

  /**
   * Valida se uma string está no formato HH:mm (24h)
   */
  static isValidTime(timeStr: string): boolean {
    return /^([01]\d|2[0-3]):[0-5]\d$/.test(timeStr)
  }

  /**
   * Formata uma Date para string "HH:mm"
   */
  static formatTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  }

  /**
   * Converte string "HH:mm" em Date com a data de hoje
   */
  static parseTime(timeStr: string): Date | null {
    // Valida formato HH:mm
    if (!this.isValidTime(timeStr)) return null

    const [hours, minutes] = timeStr.split(':').map(Number)

    // Garantia extra, mesmo que isValidTime já proteja
    if (hours === undefined || minutes === undefined) return null

    const now = new Date()
    now.setHours(hours, minutes, 0, 0)
    return now
  }

  /**
   * Adiciona minutos a uma data
   */
  static addMinutes(date: Date, minutes: number): Date {
    const result = new Date(date)
    result.setMinutes(result.getMinutes() + minutes)
    return result
  }

  /**
   * Subtrai minutos de uma data
   */
  static subtractMinutes(date: Date, minutes: number): Date {
    return this.addMinutes(date, -minutes)
  }

  /**
   * Compara se duas strings de tempo são iguais (HH:mm)
   */
  static isSameTime(time1: string, time2: string): boolean {
    return time1 === time2
  }

  /**
   * Calcula diferença entre duas datas em minutos
   */
  static diffInMinutes(date1: Date, date2: Date): number {
    const diffMs = Math.abs(date1.getTime() - date2.getTime())
    return Math.floor(diffMs / 60000)
  }

  /**
   * Formata hora em determinado fuso horário
   */
  static formatTimeInTimeZone(
    date: Date,
    timeZone: string,
    locale: string = 'pt-BR',
  ): string {
    return date.toLocaleTimeString(locale, {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  /**
   * Verifica se um horário está entre dois horários
   */
  static isTimeBetween(time: Date, start: Date, end: Date): boolean {
    const toMinutes = (d: Date) => d.getHours() * 60 + d.getMinutes()
    const t = toMinutes(time)
    const s = toMinutes(start)
    const e = toMinutes(end)
    return t >= s && t <= e
  }

  /**
   * Converte minutos para formato "Xh Ym"
   */
  static convertMinutesToReadable(minutes: number): string {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return [h > 0 ? `${h}h` : '', m > 0 ? `${m}m` : '']
      .filter(Boolean)
      .join(' ') || '0m'
  }
}
