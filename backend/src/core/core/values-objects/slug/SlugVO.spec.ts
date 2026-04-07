import { describe, expect, it } from 'vitest'
import { BadRequestError } from '../../errors'
import { SlugVO } from './SlugVO'

// 🧪 Testes do Value Object SlugVO
describe('SlugVO', () => {
  // ============================================================
  // ✅ Casos de sucesso - create()
  // ============================================================
  it('deve criar um slug válido com create()', () => {
    const slug = SlugVO.create('valid-slug')
    expect(slug.getValue()).toBe('valid-slug')
    expect(slug.isValid()).toBe(true)
  })

  it('deve converter para minúsculas e trimar espaços com create()', () => {
    const slug = SlugVO.create('  My-Slug  ')
    expect(slug.getValue()).toBe('my-slug')
  })

  // ============================================================
  // ❌ Casos de erro - create()
  // ============================================================
  it('deve lançar erro para slug inválido (caracteres especiais)', () => {
    expect(() => SlugVO.create('invalid slug!')).toThrow(BadRequestError)
  })

  it('deve lançar erro se o slug for muito curto', () => {
    expect(() => SlugVO.create('ab')).toThrow(BadRequestError)
  })

  it('deve lançar erro se o slug for muito longo', () => {
    const longSlug = 'a'.repeat(101)
    expect(() => SlugVO.create(longSlug)).toThrow(BadRequestError)
  })

  // ============================================================
  // ✅ Casos de sucesso - createFromText()
  // ============================================================
  it('deve gerar slug válido a partir de texto com acentos e espaços', () => {
    const slug = SlugVO.createFromText('Título com Ácentos e Espaços!')
    expect(slug.getValue()).toBe('titulo-com-acentos-e-espacos')
  })

  it('deve remover múltiplos hífens e underscores', () => {
    const slug = SlugVO.createFromText('___Hello---World___')
    expect(slug.getValue()).toBe('hello-world')
  })

  // ============================================================
  // ❌ Casos de erro - createFromText()
  // ============================================================
  it('deve lançar erro se o texto for vazio', () => {
    expect(() => SlugVO.createFromText('')).toThrow(BadRequestError)
  })

  it('deve lançar erro se o texto contiver apenas símbolos', () => {
    expect(() => SlugVO.createFromText('$$$!!!')).toThrow(BadRequestError)
  })

  // ============================================================
  // 🧩 Testes de validação direta
  // ============================================================
  it('isValid() deve retornar true para slug correto', () => {
    expect(SlugVO.isValid('valid-slug')).toBe(true)
  })

  it('isValid() deve retornar false para slug inválido', () => {
    expect(SlugVO.isValid('invalid slug')).toBe(false)
    expect(SlugVO.isValid('')).toBe(false)
  })

  // ============================================================
  // 🔒 Imutabilidade
  // ============================================================
  // it('não deve permitir alteração direta do valor interno', () => {
  //   const slug = SlugVO.create('immutable-test')

  //   // Tentativa de mutação direta (deve falhar)
  //   // @ts-expect-error proposital
  //   slug.getValue = 'alterado'

  //   expect(slug.getValue).toBe('immutable-test')
  // })
})
