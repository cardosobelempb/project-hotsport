/* =====================================================================================
 *  REPLACE<T, U>
 * ===================================================================================== */

import { Merge } from "./Merge";

/**
 * Substitui campos de T pelos equivalentes de U.
 * Igual ao Merge, mas semanticamente mais claro em modelagem de domínio.
 *
 * @example
 * type User = { id: string; age: number }
 * type Patch = { age: string }
 *
 * type Updated = Replace<User, Patch>
 * // { id: string; age: string }
 */
export type Replace<T, U> = Merge<T, U>
