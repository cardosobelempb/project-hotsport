import { BadRequestError } from '../../errors'
import { messages } from './desciption-message.vo'

type DescriptionValidationOptions = {
  required?: boolean
  maxLength?: number
  minLength?: number
}

export class DescriptionVO {
  private readonly value: string

  private constructor(value: string) {
    this.value = value
  }

  public static create(
    rawValue: string,
    lang: 'pt' | 'en' = 'en',
    options: DescriptionValidationOptions = { required: true, maxLength: 500 },
  ): DescriptionVO {
    const msg = messages[lang] ?? messages['en']
    const value = DescriptionVO.normalize(rawValue)

    const { required = true, maxLength = 500, minLength = 0 } = options

    if (required && value.length === 0) {
      throw new BadRequestError(msg.EMPTY)
    }

    if (value.length < minLength) {
      throw new BadRequestError(
        msg.TOO_SHORT ?? `Minimum length is ${minLength}`,
      )
    }

    if (value.length > maxLength) {
      throw new BadRequestError(
        msg.TOO_LONG ?? `Maximum length is ${maxLength}`,
      )
    }

    return new DescriptionVO(value)
  }

  // Normaliza: trim + remove múltiplos espaços
  private static normalize(value: string): string {
    return (value ?? '').trim().replace(/\s+/g, ' ')
  }

  public getValue(): string {
    return this.value
  }

  public toString(): string {
    return this.value
  }

  // Compara com outro DescriptionVO
  public equals(other: DescriptionVO): boolean {
    return this.value === other.getValue()
  }
}

/**
 * Exemplo prático:
 const desc1 = DescriptionVO.create('  Esta é uma descrição de teste.  ')
console.log(desc1.getValue())
// "Esta é uma descrição de teste."

const desc2 = DescriptionVO.create('Esta é uma descrição de teste.')
console.log(desc1.equals(desc2))
// true

// Tentativa de criar descrição vazia com required = true
try {
  DescriptionVO.create('', 'pt', { required: true })
} catch (err) {
  console.error(err.message)
  // Ex: "Campo obrigatório" (dependendo do msg do PT)
}

 */
