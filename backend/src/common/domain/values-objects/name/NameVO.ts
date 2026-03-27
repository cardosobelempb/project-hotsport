import { BadRequestError } from '../../errors'
import { I18nAbstract } from '../../common/abstract'

interface NameOptions {
  minLength?: number
  maxLength?: number
}

export class NameVO {
  private readonly value: string

  private constructor(value: string) {
    this.value = value
  }

  /**
   * Cria um NameVO com validação e normalização.
   * @param name Nome completo
   * @param options Opções de validação
   * @param i18n Serviço de tradução (opcional)
   */
  public static create(
    name?: string,
    options: NameOptions = {},
    i18n?: I18nAbstract,
  ): NameVO {
    if (!name) {
      throw new BadRequestError(NameVO.translate('errors.name.empty', i18n))
    }

    const min = options.minLength ?? 2
    const max = options.maxLength ?? 50

    const normalizedName = NameVO.normalize(name)
    NameVO.validate(normalizedName, min, max, i18n)

    return new NameVO(normalizedName)
  }

  /** Retorna o valor do nome */
  public getValue(): string {
    return this.value
  }

  /** Compara com outro NameVO */
  public equals(other: NameVO): boolean {
    return this.value === other.getValue()
  }

  /** Normaliza o nome: trim, remove múltiplos espaços e hífens duplicados */
  private static normalize(name: string): string {
    return name.trim().replace(/\s+/g, ' ')
    // return name
    //   .normalize('NFKD')                // Normaliza acentos
    //   .replace(/[\u0300-\u036f]/g, '') // Remove diacríticos
    //   .trim()
    //   .replace(/\s+/g, ' ')             // Espaços duplicados
    //   .replace(/-+/g, '-')              // Hífens duplicados
  }

  /** Valida o nome completo */
  private static validate(
    name: string,
    min: number,
    max: number,
    i18n?: I18nAbstract,
  ): void {
    const t = (key: string, args?: Record<string, any>) =>
      i18n?.t(key, { args }) ?? NameVO.defaultMessages(key, args)

    if (name.length < min) {
      throw new BadRequestError(t('errors.name.tooShort', { min }))
    }

    if (name.length > max) {
      throw new BadRequestError(t('errors.name.tooLong', { max }))
    }

    const parts = name.split(' ')
    if (parts.length < 2) {
      throw new BadRequestError(t('errors.name.surnameMissing'))
    }

    const nameRegex = /^[\p{L}\s'-]+$/u
    if (!nameRegex.test(name)) {
      throw new BadRequestError(t('errors.name.invalidChars'))
    }
  }

  /** Tradução fallback quando i18n não é fornecido */
  private static translate(
    key: string,
    i18n?: I18nAbstract,
    args?: Record<string, any>,
  ): string {
    return i18n?.t(key, { args }) ?? NameVO.defaultMessages(key, args)
  }

  /** Mensagens padrão em português */
  private static defaultMessages(
    key: string,
    args?: Record<string, any>,
  ): string {
    const messages: Record<string, string> = {
      'errors.name.empty': 'O nome não pode estar vazio.',
      'errors.name.tooShort': `O nome deve ter pelo menos ${args?.min ?? 2} caracteres.`,
      'errors.name.tooLong': `O nome deve ter no máximo ${args?.max ?? 50} caracteres.`,
      'errors.name.surnameMissing': 'Sobrenome é obrigatório.',
      'errors.name.invalidChars':
        'Apenas letras, espaços, apóstrofos e hífens são permitidos.',
    }
    return messages[key] ?? key
  }
}
