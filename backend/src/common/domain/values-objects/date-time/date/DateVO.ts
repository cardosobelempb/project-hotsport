import { BadRequestError } from '../../../errors'
import { AbstractDateVO } from './AbstractDateVO'

export class DateVO extends AbstractDateVO {
  protected readonly value: Date

  constructor(dateString: string) {
    super()
    this.value = this.validate(dateString)
  }

  protected validate(dateString: string): Date {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      throw new BadRequestError('Invalid date format. Use YYYY-MM-DD.')
    }

    const iso = dateString.split('T')[0] || ''
    const regex = /^\d{4}-\d{2}-\d{2}$/
    if (!regex.test(iso)) {
      throw new BadRequestError('Date must be in format YYYY-MM-DD.')
    }

    return new Date(iso) // strips time
  }

  getValue(): string {
    return this.value.toISOString().split('T')[0] ?? ''
  }

  getDate(): Date {
    return this.value
  }

  toString(): string {
    return this.getValue()
  }

  equals(other: DateVO): boolean {
    return this.getValue() === other.getValue()
  }
}
