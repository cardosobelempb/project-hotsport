/* =====================================================================================
 *  READONLYDEEP<T>
 * ===================================================================================== */

/**
 * Deixa TODAS as propriedades readonly, inclusive aninhadas.
 * Excelente para proteção de estados internos.
 *
 * @example
 * type User = {
 *   name: string
 *   address: { city: string }
 * }
 *
 * type Frozen = ReadonlyDeep<User>
 * // { readonly name: string; readonly address: { readonly city: string } }
 */
export type ReadonlyDeep<T> = {
  readonly [P in keyof T]: ReadonlyDeep<T[P]>
}
