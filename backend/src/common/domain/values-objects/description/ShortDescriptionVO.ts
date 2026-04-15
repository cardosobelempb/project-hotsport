import { BadRequestError } from '../../errors'
import { messages } from './desciption-message.vo'

export class ShortDescriptionVO {
  private readonly value: string

  private constructor(value: string) {
    this.value = value
  }

  public static create(
    rawValue: string,
    lang: 'pt' | 'en' = 'en',
    maxLength: number = 100,
  ): ShortDescriptionVO {
    const msg = messages[lang] ?? messages['en']
    const value = ShortDescriptionVO.normalize(rawValue)

    if (value.length === 0) {
      throw new BadRequestError(msg.EMPTY)
    }

    if (value.length > maxLength) {
      throw new BadRequestError(
        msg.TOO_LONG ?? `Maximum length is ${maxLength}`,
      )
    }

    return new ShortDescriptionVO(value)
  }

  private static normalize(value: string): string {
    return (value ?? '').trim().replace(/\s+/g, ' ')
  }

  public getValue(): string {
    return this.value
  }

  public toString(): string {
    return this.value
  }

  public equals(other: ShortDescriptionVO): boolean {
    return this.value === other.getValue()
  }
}

/**
 const shortDesc = ShortDescriptionVO.create('Título do produto')
console.log(shortDesc.getValue())
// "Título do produto"

const longDesc = LongDescriptionVO.create('Descrição detalhada do produto, com muitas informações importantes para o cliente.')
console.log(longDesc.getValue())
// "Descrição detalhada do produto, com muitas informações importantes para o cliente."

// Comparação
const anotherLongDesc = LongDescriptionVO.create('Descrição detalhada do produto, com muitas informações importantes para o cliente.')
console.log(longDesc.equals(anotherLongDesc))
// true

 */
