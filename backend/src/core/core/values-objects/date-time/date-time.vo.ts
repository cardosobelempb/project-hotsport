import { DateVO } from './date/DateVO'
import { TimeVO } from './time/TimeVO'

export class DateTimeVO {
  private readonly dateVO: DateVO
  private readonly timeVO: TimeVO

  constructor(date: string, time: string) {
    this.dateVO = new DateVO(date)
    this.timeVO = new TimeVO(time)
  }

  /** Cria uma instância via factory */
  static create(date: string, time: string): DateTimeVO {
    return new DateTimeVO(date, time)
  }

  /** Retorna no formato ISO (YYYY-MM-DDTHH:mm:ss) */
  public getISO(): string {
    const date = this.dateVO.getValue() // YYYY-MM-DD
    const time = this.timeVO.getValue() // HH:mm
    return `${date}T${time}:00`
  }

  /** Retorna como objeto Date */
  public getDate(): Date {
    return new Date(this.getISO())
  }

  /** Retorna apenas a data (YYYY-MM-DD) */
  public getDateValue(): string {
    return this.dateVO.getValue()
  }

  /** Retorna apenas o horário (HH:mm) */
  public getTimeValue(): string {
    return this.timeVO.getValue()
  }

  /** Compara com outro DateTimeVO */
  public equals(other: DateTimeVO): boolean {
    return this.getISO() === other.getISO()
  }

  /** Representação como string ISO */
  public toString(): string {
    return this.getISO()
  }
}
