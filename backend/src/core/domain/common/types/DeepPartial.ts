/* =====================================================================================
 *  DEEPPARTIAL<T>
 * ===================================================================================== */

/**
 * Transforma qualquer estrutura aninhada em parcial (recursivo).
 *
 * Muito útil para criação de objetos em testes.
 *
 * @example
 * type User = {
 *   id: string
 *   profile: { email: string; avatar: string }
 * }
 *
 * type UserPatch = DeepPartial<User>
 */
export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>
}
