/* =====================================================================================
 *  REQUIREDONLY<T, K>
 * ===================================================================================== */

/**
 * Força apenas as propriedades K a serem obrigatórias
 * mantendo o restante sem alterações.
 *
 * Muito útil em DTOs de update.
 *
 * @example
 * type User = { id?: string; name?: string; age?: number }
 * type MustHaveName = RequiredOnly<User, 'name'>
 * // { id?: string; age?: number; name: string }
 */
export type RequiredOnly<T, K extends keyof T> =
  Required<Pick<T, K>> &
  Omit<T, K>
