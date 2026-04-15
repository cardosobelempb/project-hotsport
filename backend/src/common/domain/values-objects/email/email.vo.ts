import { I18n } from '../../../interfaces'
import { BadRequestError } from '../../errors'

interface EmailOptions {
  i18n?: I18n
}

export class EmailVO {
  private readonly _value: string
  private readonly _label?: string

  private constructor(
    value: string,
    label?: string,
    private readonly options?: EmailOptions,
  ) {
    const normalized = EmailVO.normalize(value)
    if (!EmailVO.isValid(normalized)) {
      const t = options?.i18n?.t.bind(options.i18n) ?? EmailVO.defaultMessages
      throw new BadRequestError(
        t('errors.email.invalid', { args: { email: value } }),
      )
    }

    this._value = normalized
    if (label !== undefined) {
      this._label = label
    }
  }

  // Factory estático
  public static create(
    value: string,
    label?: string,
    options?: EmailOptions,
  ): EmailVO {
    return new EmailVO(value, label, options)
  }

  // Normalização do email
  private static normalize(email: string): string {
    const [local, domain] = email.trim().split('@')
    return `${local}@${domain?.toLowerCase() ?? ''}`
  }

  // Validação do email
  public static isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Retorna o valor do email
  public getValue(): string {
    return this._value
  }

  // Retorna a label opcional
  public getLabel(): string | undefined {
    return this._label
  }

  // Cria uma cópia com nova label
  public withLabel(label: string): EmailVO {
    return new EmailVO(this._value, label, this.options)
  }

  // Compara com outro EmailVO
  public equals(other: EmailVO): boolean {
    return this._value === other.getValue()
  }

  // Serialização
  public toJSON(): { value: string; label?: string } {
    const json: { value: string; label?: string } = { value: this._value }

    if (this._label !== undefined) {
      json.label = this._label
    }

    return json
  }

  // Para string
  public toString(): string {
    return this._value
  }

  // Mensagens de fallback
  private static defaultMessages(
    key: string,
    options?: { args?: Record<string, any> },
  ): string {
    const args = options?.args ?? {}
    const messages: Record<string, string> = {
      'errors.email.invalid': `Endereço de email inválido: "${args.email ?? ''}"`,
    }
    return messages[key] ?? key
  }
}

/**
Exemplo prático de uso:
const email1 = EmailVO.create('User@GMAIL.com') // Normaliza para user@gmail.com
const email2 = email1.withLabel('trabalho')

console.log(email1.toString()) // "user@gmail.com"
console.log(email2.getLabel()) // "trabalho"
console.log(email1.equals(email2)) // true

console.log(JSON.stringify(email2.toJSON()))
// {"value":"user@gmail.com","label":"trabalho"}

// Tentativa de email inválido lança erro com mensagem de i18n ou fallback
try {
  EmailVO.create('invalid-email')
} catch (err) {
  console.error(err.message) // Endereço de email inválido: "invalid-email"
}

 */
