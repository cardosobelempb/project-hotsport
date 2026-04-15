import { Right } from './Right'

/**
 * Representa um valor no contexto de falha (lado esquerdo do Either).
 * É imutável e segue o princípio do Fail Fast/Return Early.
 *
 * L -> Tipo do erro
 * R -> Tipo do sucesso (não utilizado aqui, mas mantido para compatibilidade com Either<L, R>)
 */
export class Left<L, R> {
  readonly value: L

  constructor(value: L) {
    // Atributo imutável, evita estados inconsistentes
    this.value = value
  }

  /**
   * Indica se o valor é Right.
   * Sempre false aqui — Left representa erro.
   */
  isRight(): this is Right<L, R> {
    return false
  }

  /**
   * Indica se o valor é Left.
   * Sempre true — mantém compatibilidade com API funcional.
   */
  isLeft(): this is Left<L, R> {
    return true
  }

  /**
   * Método funcional map()
   * Para Left, o map deve retornar Left sem aplicar a função,
   * pois não faz sentido transformar um valor de erro.
   *
   * Essa implementação mantém o tipo do erro e ignora transformações no success.
   */
  map<T>(_: (r: R) => T): Left<L, T> {
    return new Left(this.value)
  }

  /**
   * fold()
   * Desestrutura o Either, executando a função de erro e ignorando a de sucesso.
   *
   * Útil para garantir handling funcional explícito.
   */
  fold<T>(onLeft: (l: L) => T, _?: (r: R) => T): T {
    return onLeft(this.value)
  }

  /**
   * Representação amigável para debug.
   */
  toString(): string {
    return `Left(${JSON.stringify(this.value)})`
  }
}

/**
 function parseNumber(value: string): Left<string, number> | Right<string, number> {
  const number = Number(value)

  if (isNaN(number)) return new Left("Valor inválido")

  return new Right(number)
}

const result = parseNumber("abc")

result
  .map(n => n * 2) // ignorado, pois result é Left
  .fold(
    err => console.error("Erro:", err),
    success => console.log("Sucesso:", success)
  )

 */
