import { BadRequestError } from '../../errors'

export class CpfVO {
  private readonly value: string

  constructor(cpf: string) {
    // Verifica se o CPF contém exatamente 11 dígitos numéricos
    if (!/^\d{11}$/.test(cpf)) {
      throw new BadRequestError(
        `Formato inválido de CPF: "${cpf}". Deve conter apenas 11 dígitos numéricos.`,
      )
    }

    // Limpa o CPF (remove pontuações) e valida
    const sanitizedCpf = CpfVO.sanitize(cpf)

    if (!CpfVO.isValid(sanitizedCpf)) {
      throw new BadRequestError(`CPF inválido: ${cpf} (limpo: ${sanitizedCpf})`)
    }

    this.value = sanitizedCpf
  }

  public getValue(): string {
    return this.value
  }

  public getFormatted(): string {
    return CpfVO.format(this.value)
  }

  public equals(other: CpfVO): boolean {
    return this.value === other.getValue()
  }

  // Valida o CPF, incluindo a verificação dos dois dígitos de controle
  public static isValid(cpf: string): boolean {
    const sanitizedCpf = this.sanitize(cpf)

    if (!/^\d{11}$/.test(sanitizedCpf)) return false
    if (/^(\d)\1+$/.test(sanitizedCpf)) return false // CPF com todos os números iguais é inválido

    const digits = sanitizedCpf.split('').map(Number)

    // Função auxiliar para calcular o dígito de verificação
    const calcCheckDigit = (base: number, arr: number[]): number => {
      const sum = arr
        .slice(0, base)
        .reduce((acc, digit, idx) => acc + digit * (base + 1 - idx), 0)
      const rest = sum % 11
      return rest < 2 ? 0 : 11 - rest
    }

    const d1 = calcCheckDigit(9, digits)
    const d2 = calcCheckDigit(10, [...digits.slice(0, 9), d1])

    return d1 === digits[9] && d2 === digits[10]
  }

  // Formata o CPF no formato XXX.XXX.XXX-XX
  public static format(cpf: string): string {
    const sanitizedCpf = this.sanitize(cpf)
    if (sanitizedCpf.length !== 11) {
      throw new Error('CPF deve conter 11 dígitos.')
    }
    return sanitizedCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  // Remove todos os caracteres não numéricos
  private static sanitize(cpf: string): string {
    return cpf.replace(/\D/g, '')
  }
}

/*
const cpf2 = new CpfVO('529.982.247-25')
console.log(cpf2.getValue()) // CPF sem formatação
console.log(cpf2.getFormatted()) // CPF formatado
console.log(cpf2.equals(new CpfVO('52998224725'))) // Comparação

try {
  const cpf = new CpfVO('529.982.247-25')
  console.log(cpf.getValue())        // '52998224725'
  console.log(cpf.getFormatted())    // '529.982.247-25'
  console.log(cpf.equals(new CpfVO('52998224725'))) // true
} catch (error) {
  console.error(error.message) // Caso o CPF seja inválido
}

*/
