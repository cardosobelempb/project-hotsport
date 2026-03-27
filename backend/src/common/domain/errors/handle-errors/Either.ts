import { Left } from './Left'
import { Right } from './Right'

/**
 * Representa um valor que pode ser falha (Left) ou sucesso (Right).
 *
 * L -> tipo da falha
 * R -> tipo do sucesso
 */
export type Either<L, R> = Left<L, R> | Right<L, R>

/**
 * Cria um Either do tipo Left (falha).
 * Útil para padronizar falhas em fluxos funcionais ou serviços.
 *
 * Ex:
 *   return left("Email inválido")
 */
export const left = <L, R = never>(value: L): Either<L, R> => {
  return new Left(value)
}

/**
 * Cria um Either do tipo Right (sucesso).
 *
 * Ex:
 *   return right({ id: 1, name: "John" })
 */
export const right = <R, L = never>(value: R): Either<L, R> => {
  return new Right(value)
}
