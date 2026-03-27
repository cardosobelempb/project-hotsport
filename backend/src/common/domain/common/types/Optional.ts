 /* =====================================================================================
  *  OPTIONAL<T, K>
  * ===================================================================================== */

/**
 * Torna um ou mais campos de um tipo opcionais.
 *
 * @template T Tipo de origem
 * @template K Chaves do tipo que devem se tornar opcionais
 *
 * @example
 * type User = { id: string; email: string; name: string }
 * type PartialUser = Optional<User, 'email'>
 * // Resultado: { id: string; name: string; email?: string }
 */
export type Optional<T, K extends keyof T> =
  Partial<Pick<T, K>> &
  Omit<T, K>
