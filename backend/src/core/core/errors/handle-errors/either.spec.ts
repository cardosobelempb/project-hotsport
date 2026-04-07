import { assertType, describe, expect, it } from 'vitest'
import { Either, left, right } from './Either'
import { Left } from './Left'
import { Right } from './Right'

describe('Either', () => {
  // ------------------------
  // LEFT
  // ------------------------
  it('deve criar um Left corretamente', () => {
    const result = left('Erro')

    expect(result).toBeInstanceOf(Left)
    expect(result.isLeft()).toBe(true)
    expect(result.isRight()).toBe(false)
    expect(result.value).toBe('Erro')
  })

  it('left() deve sempre retornar Either<L, never>', () => {
    const result = left('Falha')

    assertType<Either<string, never>>(result)
  })

  it('map() em Left deve ignorar transformação', () => {
    const result = left('Falha').map(() => 123)

    expect(result).toBeInstanceOf(Left)
    expect(result.value).toBe('Falha')
  })

  it('fold() em Left deve chamar apenas onLeft', () => {
    const result = left('Erro').fold(
      err => `LEFT: ${err}`,
      () => 'RIGHT',
    )

    expect(result).toBe('LEFT: Erro')
  })

  // ------------------------
  // RIGHT
  // ------------------------
  it('deve criar um Right corretamente', () => {
    const result = right(100)

    expect(result).toBeInstanceOf(Right)
    expect(result.isRight()).toBe(true)
    expect(result.isLeft()).toBe(false)
    expect(result.value).toBe(100)
  })

  it('right() deve sempre retornar Either<never, R>', () => {
    const result = right(42)

    assertType<Either<never, number>>(result)
  })

  it('map() em Right deve transformar valor interno', () => {
    const result = right(10).map(n => n * 2)

    expect(result.isRight()).toBe(true)
    expect(result.value).toBe(20)
  })

  it('fold() em Right deve chamar apenas onRight', () => {
    const result = right(5).fold(
      () => 'LEFT',
      value => `RIGHT: ${value}`,
    )

    expect(result).toBe('RIGHT: 5')
  })

  // ------------------------
  // Encadeamento funcional
  // ------------------------
  it('deve permitir pipelines funcionais', () => {
    const result = right(2)
      .map(n => n + 1)
      .map(n => n * 5)
      .fold(
        () => 'ERRO',
        val => val.toString(),
      )

    expect(result).toBe('15')
  })

  it('Left deve quebrar pipeline funcional imediatamente', () => {
    const result = left('x')
      .map(() => 999)
      .map(() => 111)
      .fold(
        err => `ERRO: ${err}`,
        val => val.toString(),
      )

    expect(result).toBe('ERRO: x')
  })
})
