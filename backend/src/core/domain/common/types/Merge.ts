/* =====================================================================================
 *  MERGE<T, U>
 * ===================================================================================== */

/**
 * Merge de dois tipos (U sobrescreve T).
 *
 * @example
 * type A = { id: string; name: string }
 * type B = { name: number }
 *
 * type C = Merge<A, B>
 * // { id: string; name: number }
 */
export type Merge<T, U> = Omit<T, keyof U> & U
