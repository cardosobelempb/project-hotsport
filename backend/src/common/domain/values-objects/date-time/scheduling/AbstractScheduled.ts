let Dayjs: any
let dayjs: any
try {
  Dayjs = require('dayjs')
  dayjs = require('dayjs')
} catch {
  Dayjs = null
  dayjs = null
}

export abstract class AbstractScheduled {
  protected abstract date: unknown

  /**
   * Retorna a data no formato YYYY-MM-DD HH:mm
   */
  abstract toString(): string

  /**
   * Retorna o valor bruto da data (Date, Dayjs, etc.)
   */
  abstract getValue(): unknown

  /**
   * Verifica se a data está dentro de um intervalo de agendamento permitido
   */
  abstract isValid(): boolean

  /**
   * Validações genéricas: data deve ser futura mas não muito distante
   * A data não pode ser mais de um ano no futuro
   */
  protected isValidSchedule(dateTimestamp: number, now: number): boolean {
    const oneYearAhead = now + 1000 * 60 * 60 * 24 * 365 // Um ano em milissegundos
    return dateTimestamp >= now && dateTimestamp <= oneYearAhead
  }

  /**
   * Valida se a data é válida utilizando o Dayjs ou Date nativo
   */
  protected validateDate(input: Date | string | typeof Dayjs): typeof Dayjs {
    let parsed: typeof Dayjs

    if (Dayjs) {
      // Se Dayjs estiver disponível, usamos ele
      parsed = dayjs(input)
    } else {
      // Caso contrário, usamos o Date nativo
      parsed = dayjs(new Date(input))
    }

    if (!parsed.isValid()) {
      throw new Error('Invalid date format.')
    }

    return parsed
  }
}
