import { BadRequestError } from '../../errors'
import { AbstractValueObject } from '../AbstractValueObject'

/**
 * ✅ Value Object responsável por representar e validar um Slug.
 * Garante imutabilidade, padronização e formato seguro para URLs.
 */
export class SlugVO extends AbstractValueObject<string> {
  private static readonly MIN_LENGTH = 3
  private static readonly MAX_LENGTH = 100
  private static readonly SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

  /** 🔒 Construtor privado: força o uso das fábricas estáticas */
  private constructor(value: string) {
    super(value)
  }

  // ===============================
  // 🚀 MÉTODOS DE FÁBRICA
  // ===============================

  /**
   * Cria um Slug a partir de uma string **já formatada**.
   * @throws BadRequestError se o slug for inválido.
   */
  public static create(value: string): SlugVO {
    const normalized = value?.trim().toLowerCase()

    if (!SlugVO.isValid(normalized)) {
      throw new BadRequestError(`Invalid slug format: "${value}"`)
    }

    return new SlugVO(normalized)
  }

  /**
   * Gera um Slug a partir de um texto bruto (ex: título, nome, etc).
   * Aplica normalização Unicode, substituições e validação.
   * @throws BadRequestError se o resultado não atender aos critérios.
   */
  public static createFromText(text: string): SlugVO {
    if (!text || text.trim().length === 0) {
      throw new BadRequestError('Slug source text cannot be empty.')
    }

    // 🧹 Normalização Unicode (remove acentos e diacríticos)
    const slugText = text
      .normalize('NFD')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-') // troca espaços por hífen
      .replace(/[^\w-]+/g, '') // remove símbolos
      .replace(/_/g, '-') // substitui underscores
      .replace(/--+/g, '-') // evita múltiplos hífens
      .replace(/^-+|-+$/g, '') // remove hífens nas bordas

    if (!SlugVO.isValid(slugText)) {
      throw new BadRequestError(`Invalid slug generated: "${slugText}"`)
    }

    return new SlugVO(slugText)
  }

  // ===============================
  // 🧪 MÉTODOS DE VALIDAÇÃO
  // ===============================

  /** Implementação do contrato abstrato da classe base */
  public isValid(): boolean {
    return SlugVO.isValid(this.value)
  }

  /** Verifica se o slug informado é válido. */
  public static isValid(value: string): boolean {
    if (!value) return false
    return (
      value.length >= SlugVO.MIN_LENGTH &&
      value.length <= SlugVO.MAX_LENGTH &&
      SlugVO.SLUG_REGEX.test(value)
    )
  }
}
