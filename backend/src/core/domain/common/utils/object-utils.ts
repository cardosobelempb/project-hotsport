export class ObjectUtils {
  private constructor() {}

  // ---------------------------------------------------------------------------
  // Basic Checks
  // ---------------------------------------------------------------------------

  /**
   * Retorna `true` se for um objeto simples (exclui arrays, null, Date, etc.)
   */
  static isObject(value: unknown): value is Record<string, any> {
    return (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      !(value instanceof Date)
    )
  }

  // ---------------------------------------------------------------------------
  // Cloning
  // ---------------------------------------------------------------------------

  /**
   * Conversão segura para objeto plano JSON (sem funções, Date, Map etc.)
   * OBS: valores não-serializáveis serão perdidos.
   */
  static convertToPlainObject<T>(value: T): T {
    return JSON.parse(JSON.stringify(value))
  }

  /**
   * Deep clone usando serialização. Para objetos muito complexos, recomenda-se
   * usar structuredClone (Node 17+ / browsers modernos).
   */
  static deepClone<T>(value: T): T {
    // Caso ambiente suporte structuredClone:
    if (typeof structuredClone === "function") {
      try {
        return structuredClone(value)
      } catch {
        // fallback abaixo
      }
    }
    return this.convertToPlainObject(value)
  }

  // ---------------------------------------------------------------------------
  // Empty checks
  // ---------------------------------------------------------------------------

  /**
   * Verifica se um valor é "vazio":
   *  - null, undefined → true
   *  - [] → true
   *  - {} → true
   *  - outros tipos → false
   */
  static isEmpty(value: unknown): boolean {
    if (value == null) return true
    if (Array.isArray(value)) return value.length === 0
    if (this.isObject(value)) return Object.keys(value).length === 0
    return false
  }

  // ---------------------------------------------------------------------------
  // Deep Merge
  // ---------------------------------------------------------------------------

  /**
   * Merge profundo entre dois objetos.
   * - Valores escalares sobrescrevem o target
   * - Objetos são mesclados recursivamente
   */
  static mergeDeep<T extends object>(target: T, source: Partial<T>): T {
    if (!this.isObject(target) || !this.isObject(source)) {
      return source as T
    }

    const result = { ...target } as Record<string, any>

    for (const key in source) {
      const sourceValue = source[key]
      const targetValue = result[key]

      if (this.isObject(sourceValue)) {
        result[key] = this.mergeDeep(
          this.isObject(targetValue) ? targetValue : {},
          sourceValue
        )
      } else {
        result[key] = sourceValue
      }
    }

    return result as T
  }
}
