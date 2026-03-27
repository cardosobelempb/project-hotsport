import { ChecksAbstract } from './ChecksAbstract'

let dayjs: any
try {
  dayjs = require('dayjs')
} catch {
  dayjs = null
}

export class CheckInVO extends ChecksAbstract {
  private constructor(input: Date | string) {
    super(input)
  }

  /** Cria uma nova instância */
  public static create(input: Date | string): CheckInVO {
    if (!input) throw new Error('Check-in date is required')
    return new CheckInVO(input)
  }

  /** Retorna true se a data for anterior a hoje */
  public isPast(): boolean {
    const today = dayjs ? dayjs().startOf('day') : new Date()
    if (!dayjs) today.setHours(0, 0, 0, 0)

    const value = this.toDate()
    return dayjs ? dayjs(value).isBefore(today, 'day') : value.getTime() < today.getTime()
  }

  /** Retorna true se a data for posterior a hoje */
  public isFuture(): boolean {
    const today = dayjs ? dayjs().startOf('day') : new Date()
    if (!dayjs) today.setHours(0, 0, 0, 0)

    const value = this.toDate()
    return dayjs ? dayjs(value).isAfter(today, 'day') : value.getTime() > today.getTime()
  }

  /** Retorna true se a data for hoje */
  public isToday(): boolean {
    const today = dayjs ? dayjs().startOf('day') : new Date()
    if (!dayjs) today.setHours(0, 0, 0, 0)

    const value = this.toDate()
    return dayjs ? dayjs(value).isSame(today, 'day') : value.getTime() === today.getTime()
  }

  /** Verifica se o check-in expirou (antes de hoje) */
  public isExpired(): boolean {
    return this.isPast()
  }

  /**
   * Verifica se a data de hoje está dentro do intervalo fornecido.
   * @param start Data de início (inclusive)
   * @param end Data de fim (inclusive)
   */
  public static isTodayWithinRange(start: Date | string, end: Date | string): boolean {
    const today = dayjs ? dayjs().startOf('day') : new Date()
    if (!dayjs) today.setHours(0, 0, 0, 0)

    const startDate = dayjs ? dayjs(start).startOf('day') : new Date(start)
    const endDate = dayjs ? dayjs(end).startOf('day') : new Date(end)
    if (!dayjs) {
      startDate.setHours(0, 0, 0, 0)
      endDate.setHours(0, 0, 0, 0)
    }

    return dayjs
      ? today.isAfter(startDate.subtract(1, 'day')) && today.isBefore(endDate.add(1, 'day'))
      : today.getTime() >= startDate.getTime() && today.getTime() <= endDate.getTime()
  }
}
