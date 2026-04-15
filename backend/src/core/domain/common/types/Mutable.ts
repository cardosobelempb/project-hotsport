/* =====================================================================================
 *  MUTABLE<T>
 * ===================================================================================== */

/**
 * Remove readonly de todas as propriedades.
 *
 * Atenção: deve ser usado com parcimônia.
 *
 * @example
 * type User = { readonly id: string; readonly name: string }
 * type WritableUser = Mutable<User>
 */
export type Mutable<T> = {
  -readonly [P in keyof T]: T[P]
}
