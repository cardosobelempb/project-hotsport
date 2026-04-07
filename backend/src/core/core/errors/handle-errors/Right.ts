import { Left } from './Left'

/**
 * Representa o lado de sucesso do Either.
 * Imutável e seguro. Utilizado quando uma operação é bem-sucedida.
 *
 * L -> Tipo do erro
 * R -> Tipo de sucesso
 */
export class Right<L, R> {
  readonly value: R

  constructor(value: R) {
    // Mantém imutabilidade e integridade
    this.value = value
  }

  /**
   * Sempre true para Right — usado para narrowing.
   */
  isRight(): this is Right<L, R> {
    return true
  }

  /**
   * Sempre false — mantém compatibilidade com a API funcional.
   */
  isLeft(): this is Left<L, R> {
    return false
  }

  /**
   * Transforma o valor interno de sucesso.
   * Mantém Left intacto (mas aqui é Right, então transforma normalmente).
   *
   * Segue semântica FP: map NÃO lida com erros.
   */
  map<T>(fn: (r: R) => T): Right<L, T> {
    const newValue = fn(this.value)
    return new Right(newValue)
  }

  /**
   * fold()
   * Desestrutura o Either chamando a função de sucesso (onRight).
   * A função de erro é ignorada aqui.
   *
   * Útil para extrair o valor sem precisar checar Left/Right manualmente.
   */
  fold<T>(_: (l: L) => T, onRight: (r: R) => T): T {
    return onRight(this.value)
  }

  /**
   * Representação útil para logs e debugging.
   */
  toString(): string {
    return `Right(${JSON.stringify(this.value)})`
  }
}

/**
function divide(a: number, b: number): Left<string, number> | Right<string, number> {
  if (b === 0) return new Left("Divisão por zero")
  return new Right(a / b)
}

const result = divide(10, 2)

result
  .map(n => n * 3)    // transforma (porque é Right)
  .fold(
    err => console.error("Erro:", err),
    value => console.log("Sucesso:", value)
  )

 */
