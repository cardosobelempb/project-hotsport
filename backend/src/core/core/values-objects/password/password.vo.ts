import { BadRequestError } from '../../errors'
import { HashAbstract } from '../../common/abstract/HashAbstract'

/**
 * Define as regras de validação para criação de senhas.
 */
export interface PasswordOptions {
  minLength?: number
  maxLength?: number
  requireUppercase?: boolean
  requireLowercase?: boolean
  requireDigit?: boolean
  requireSpecialChar?: boolean
}

/**
 * Value Object responsável por encapsular e validar senhas.
 * Aplica validações consistentes, permite hashing e comparação segura.
 */
export class PasswordVO {
  private readonly value: string
  private readonly hasher?: HashAbstract
  private readonly options: Required<PasswordOptions>

  constructor(
    password: string,
    hasher?: HashAbstract,
    options: PasswordOptions = {},
  ) {
    if (!password || password.trim().length === 0) {
      throw new BadRequestError('Password cannot be empty.')
    }

    this.value = password

    // Só atribui se hash existe
    if (hasher !== undefined) {
      this.hasher = hasher
    }

    // Define valores padrão — evita checagens repetidas
    this.options = {
      minLength: options.minLength ?? 8,
      maxLength: options.maxLength ?? 64,
      requireUppercase: options.requireUppercase ?? true,
      requireLowercase: options.requireLowercase ?? true,
      requireDigit: options.requireDigit ?? true,
      requireSpecialChar: options.requireSpecialChar ?? true,
    }

    this.validate(password)
  }

  /**
   * Realiza validação completa da senha.
   * @throws {BadRequestError} se a senha violar alguma regra.
   */
  private validate(password: string): void {
    const {
      minLength,
      maxLength,
      requireUppercase,
      requireLowercase,
      requireDigit,
      requireSpecialChar,
    } = this.options

    if (password.length < minLength) {
      throw new BadRequestError(
        `Password must be at least ${minLength} characters.`,
      )
    }

    if (password.length > maxLength) {
      throw new BadRequestError(
        `Password must be at most ${maxLength} characters.`,
      )
    }

    if (requireUppercase && !/[A-Z]/.test(password)) {
      throw new BadRequestError(
        'Password must include at least one uppercase letter.',
      )
    }

    if (requireLowercase && !/[a-z]/.test(password)) {
      throw new BadRequestError(
        'Password must include at least one lowercase letter.',
      )
    }

    if (requireDigit && !/\d/.test(password)) {
      throw new BadRequestError('Password must include at least one digit.')
    }

    if (
      requireSpecialChar &&
      !/[!@#$%^&*(),.?":{}|<>_\-\\[\];'/+=~`]/.test(password)
    ) {
      throw new BadRequestError(
        'Password must include at least one special character.',
      )
    }
  }

  /**
   * Compara duas senhas de texto puro.
   */
  public static confirm(password?: string, confirmPassword?: string): void {
    if (!password || !confirmPassword) {
      throw new BadRequestError('Password and confirmation cannot be empty.')
    }
    if (password !== confirmPassword) {
      throw new BadRequestError('Password and confirmation do not match.')
    }
  }

  /**
   * Verifica se a senha antiga confere com o hash salvo.
   */
  public static async validateOldPassword(
    oldPassword: string,
    oldHash: string,
    hasher: HashAbstract,
  ): Promise<void> {
    if (!hasher) throw new BadRequestError('Hasher not provided.')
    const match = await hasher.compare(oldPassword, oldHash)
    if (!match) throw new BadRequestError('Old password is incorrect.')
  }

  /**
   * Gera uma senha aleatória forte.
   */
  public static generatePassword(
    length = 12,
    useUpperCase = true,
    useNumbers = true,
    useSymbols = true,
  ): string {
    const lower = 'abcdefghijklmnopqrstuvwxyz'
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const numbers = '0123456789'
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'

    let chars = lower
    if (useUpperCase) chars += upper
    if (useNumbers) chars += numbers
    if (useSymbols) chars += symbols

    let password = ''
    for (let i = 0; i < length; i++) {
      const index = Math.floor(Math.random() * chars.length)
      password += chars[index]
    }

    return password
  }

  /**
   * Gera o hash da senha.
   */
  public async hash(saltRounds = 10): Promise<string> {
    if (!this.hasher) {
      throw new BadRequestError('Hasher not provided. Cannot hash password.')
    }
    return this.hasher.hash(this.value, saltRounds)
  }

  /**
   * Verifica se uma senha fornecida corresponde a um hash.
   */
  public async verify(password: string, hash: string): Promise<boolean> {
    if (!this.hasher) {
      throw new BadRequestError('Hasher not provided. Cannot verify password.')
    }
    return this.hasher.compare(password, hash)
  }

  /**
   * Compara o valor atual com um hash.
   */
  public async matchesHash(hash: string): Promise<boolean> {
    if (!this.hasher) {
      throw new BadRequestError(
        'Hasher not provided. Cannot check hash validity.',
      )
    }
    return this.hasher.compare(this.value, hash)
  }

  /**
   * Verifica se uma string tem formato de hash bcrypt válido.
   */
  public static isValidBcryptHash(hash?: string): boolean {
    if (!hash) return false
    const bcryptRegex = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/
    return bcryptRegex.test(hash)
  }

  /** Retorna a senha em texto puro (⚠️ use com cuidado). */
  public getValue(): string {
    return this.value
  }
}

/**
import { PasswordVO } from './password.vo'
import { BcryptHasher } from '../infra/bcrypt-hasher'

const hasher = new BcryptHasher()

// ✅ Criar senha segura
const password = new PasswordVO('MyP@ssword123', hasher)
const hash = await password.hash()
console.log(hash) // $2b$10$...

// ✅ Verificar senha antiga
await PasswordVO.validateOldPassword('MyP@ssword123', hash, hasher)

// ✅ Comparar senhas
PasswordVO.confirm('abc123!', 'abc123!') // ok
// PasswordVO.confirm('abc123!', 'abc123') // lança erro

// ✅ Validar hash bcrypt
console.log(PasswordVO.isValidBcryptHash(hash)) // true

// ✅ Gerar senha forte
console.log(PasswordVO.generatePassword(16, true, true, true)) // Ex: "hB@1jL$8zP0&xA"

 */
