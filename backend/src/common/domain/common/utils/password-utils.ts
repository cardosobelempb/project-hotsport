import { HashComparer, HashGenerator } from "../abstract"

export class PasswordUtils {
  constructor(
    private readonly hashComparer: HashComparer,
    private readonly hashGenerator: HashGenerator
  ) {}

  // ---------------------------------------------------------------------------
  // Constants
  // ---------------------------------------------------------------------------

  private static readonly LOWER = "abcdefghijklmnopqrstuvwxyz"
  private static readonly UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  private static readonly NUMBERS = "0123456789"
  private static readonly SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?"

  private static readonly SYMBOL_REGEX = /[!@#$%^&*(),.?":{}|<>]/


  // ---------------------------------------------------------------------------
  // Password Generation
  // ---------------------------------------------------------------------------

  /**
   * Gera senha aleatória com opções configuráveis.
   * Usa crypto.getRandomValues() quando disponível (mais seguro).
   */

  static generatePassword(
    length: number = 12,
    useUpperCase: boolean = true,
    useNumbers: boolean = true,
    useSymbols: boolean = true
  ): string {
    let charset = this.LOWER
    if (useUpperCase) charset += this.UPPER
    if (useNumbers) charset += this.NUMBERS
    if (useSymbols) charset += this.SYMBOLS

    if (charset.length === 0) {
      throw new Error("Nenhum conjunto de caracteres selecionado para gerar senha.")
    }

    const result: string[] = []
    const charsetLength = charset.length

    for (let i = 0; i < length; i++) {
      const randomIndex = this.getSecureRandomInt(charsetLength)
      const char = charset[randomIndex]
      if (char === undefined) throw new Error("Índice fora do charset")
      result.push(char)
    }

    return result.join("")
  }

  /**
   * Gera um número aleatório seguro usando crypto API, com fallback.
   */
  private static getSecureRandomInt(max: number): number {
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const buffer = new Uint32Array(1)
      if (!buffer[0]) return 0

      crypto.getRandomValues(buffer)
      return buffer[0] % max
    }
    // Fallback (menos seguro, mas funcional no Node antigo)
    return Math.floor(Math.random() * max)
  }

  // ---------------------------------------------------------------------------
  // Password Requirements
  // ---------------------------------------------------------------------------

  /**
   * Valida requisitos mínimos de senha.
   */
  static validatePassword(password: string): boolean {
    const minLength = 8

    return (
      password.length >= minLength &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      this.SYMBOL_REGEX.test(password)
    )
  }

  // ---------------------------------------------------------------------------
  // Strength
  // ---------------------------------------------------------------------------

  /**
   * Mede força da senha de forma simplificada.
   * Pode ser estendido para incluir pontuação mais avançada.
   */
  static getPasswordStrength(password: string): "Fraca" | "Média" | "Forte" {
    let score = 0

    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (this.SYMBOL_REGEX.test(password)) score++

    if (score <= 1) return "Fraca"
    if (score <= 3) return "Média"
    return "Forte"
  }

  // ---------------------------------------------------------------------------
  // Hashing
  // ---------------------------------------------------------------------------

  async hash(password: string): Promise<string> {
    return this.hashGenerator.hash(password)
  }

  async compare(password: string, hashed: string): Promise<boolean> {
    return this.hashComparer.compare(password, hashed)
  }
}
