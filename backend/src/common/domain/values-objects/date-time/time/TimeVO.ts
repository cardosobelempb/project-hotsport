import { BadRequestError } from '../../../errors'
import { AbstractTimeVO } from './AbstractTimeVO'

export class TimeVO extends AbstractTimeVO {
  protected readonly value: string

  constructor(time: string) {
    super()
    this.value = this.validate(time)
  }

  protected validate(time: string): string {
    const regex = /^([01]\d|2[0-3]):[0-5]\d$/
    if (!regex.test(time)) {
      throw new BadRequestError('Time must be in 24h format HH:mm.')
    }
    return time
  }

  getValue(): string {
    return this.value
  }

  getHours(): number {
    return parseInt(this.value.split(':')[0] ?? '0', 10)
  }

  getMinutes(): number {
    return parseInt(this.value.split(':')[1] ?? '0', 10)
  }

  toString(): string {
    return this.value
  }

  equals(other: TimeVO): boolean {
    return this.value === other.getValue()
  }
}
