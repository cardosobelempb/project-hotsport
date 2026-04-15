export abstract class AbstractDateOfBirth {
  protected abstract date: unknown

  /** Retorna a data no formato YYYY-MM-DD */
  abstract toString(): string

  /** Retorna a data como objeto bruto (Date, Dayjs, etc.) */
  abstract getValue(): unknown

  /** Verifica se a data é válida */
  abstract isValid(): boolean

  /** Calcula a idade atual com base na data de nascimento */
  abstract getAge(): number

  /** Validação comum de idade (mín: 0, máx: 130 anos) */
  protected isValidAge(age: number): boolean {
    return age >= 0 && age <= 130
  }
}
