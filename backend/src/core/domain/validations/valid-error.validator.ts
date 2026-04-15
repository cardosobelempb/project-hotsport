export class ValidError {
  readonly field: string
  readonly errorCode: string

  constructor(field: string, errorCode: string) {
    this.field = field
    this.errorCode = errorCode
  }

  equals(other: unknown): boolean {
    if (!(other instanceof ValidError)) return false
    return this.field === other.field && this.errorCode === other.errorCode
  }

  hashCode(): number {
    // Simulando um hashCode simples baseado em strings
    const hashString = `${this.field}:${this.errorCode}`
    let hash = 0
    for (let i = 0; i < hashString.length; i++) {
      const char = hashString.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash |= 0 // Convert to 32bit integer
    }
    return hash
  }

  toString(): string {
    return `ValidError{field='${this.field}', errorCode='${this.errorCode}'}`
  }
}
