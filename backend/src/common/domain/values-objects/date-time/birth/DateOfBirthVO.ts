import { BadRequestError } from '../../../errors'
import { AbstractDateOfBirth } from './AbstractDateOfBirth'

let dayjs: any
try {
  dayjs = require('dayjs')
} catch {
  dayjs = null
}

export class DateOfBirthVO extends AbstractDateOfBirth {
  protected readonly date: any // Dayjs ou Date

  constructor(input: string | Date) {
    super()

    let parsed: any
    if (dayjs) {
      parsed = dayjs(input)
      if (!parsed.isValid()) {
        throw new BadRequestError('Invalid date.')
      }
    } else {
      parsed = input instanceof Date ? input : new Date(input)
      if (isNaN(parsed.getTime())) {
        throw new BadRequestError('Invalid date.')
      }
    }

    const age = this.calculateAge(parsed)
    if (!this.isValidAge(age)) {
      throw new BadRequestError(
        'Age outside the permitted range (0-130 years).',
      )
    }

    this.date = parsed
  }

  static create(input: string | Date): DateOfBirthVO {
    return new DateOfBirthVO(input)
  }

  getValue(): any {
    return this.date
  }

  toString(): string {
    if (dayjs) {
      return this.date.format('YYYY-MM-DD')
    }
    return this.date.toISOString().split('T')[0]
  }

  isValid(): boolean {
    if (dayjs) {
      return this.date.isValid() && this.isValidAge(this.getAge())
    }
    return !isNaN(this.date.getTime()) && this.isValidAge(this.getAge())
  }

  getAge(): number {
    return this.calculateAge(this.date)
  }

  private calculateAge(parsed: any): number {
    if (dayjs) {
      return dayjs().diff(parsed, 'year')
    } else {
      const today = new Date()
      let age = today.getFullYear() - parsed.getFullYear()
      const m = today.getMonth() - parsed.getMonth()
      if (m < 0 || (m === 0 && today.getDate() < parsed.getDate())) {
        age--
      }
      return age
    }
  }
}
