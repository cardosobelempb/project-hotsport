export class ValidFieldMessage {
  fieldName: string
  message: string

  constructor(fieldName: string = '', message: string = '') {
    this.fieldName = fieldName
    this.message = message
  }

  getFieldName(): string {
    return this.fieldName
  }

  getMessage(): string {
    return this.message
  }

  equals(other: unknown): boolean {
    if (!(other instanceof ValidFieldMessage)) return false
    return this.fieldName === other.fieldName && this.message === other.message
  }

  hashCode(): number {
    const str = `${this.fieldName}:${this.message}`
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash |= 0 // Convert to 32bit int
    }
    return hash
  }

  toString(): string {
    return `ValidFieldMessage{fieldName='${this.fieldName}', message='${this.message}'}`
  }
}
