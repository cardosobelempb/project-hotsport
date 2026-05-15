// ============================================================
// DateOfBirthVO.ts
// Ajustado para ficar compatível com a BaseVO atual
// ============================================================

import { BadRequestError } from "@/common/domain/errors/controllers/bad-request.error";
import { BaseVO } from "../../base.vo";

/**
 * Data de nascimento com validação de formato e faixa etária.
 * - Aceita string ou Date
 * - Valida idade entre 0 e 130 anos
 * - Retorna string no formato YYYY-MM-DD
 */
export class DateOfBirthVO extends BaseVO<Date> {
  private static readonly MIN_AGE = 0;
  private static readonly MAX_AGE = 130;

  private constructor(value: Date) {
    super(value);
  }

  /**
   * Factory com validação centralizada.
   */
  public static create(input: string | Date): DateOfBirthVO {
    const parsed = DateOfBirthVO.parseInput(input);

    const age = DateOfBirthVO.calculateAge(parsed);
    if (!DateOfBirthVO.isValidAge(age)) {
      throw new BadRequestError({
        fieldName: "dateOfBirth",
        value: input instanceof Date ? input.toISOString() : input,
        message: `Idade inválida: ${age} anos. A idade deve ser entre ${DateOfBirthVO.MIN_AGE} e ${DateOfBirthVO.MAX_AGE} anos.`,
      });
    }

    return new DateOfBirthVO(parsed);
  }

  /**
   * Retorna o valor encapsulado.
   */
  public getValue(): Date {
    return this.value;
  }

  /**
   * Retorna a idade atual calculada.
   */
  public getAge(): number {
    return DateOfBirthVO.calculateAge(this.value);
  }

  /**
   * Formato padrão para exibição e persistência.
   */
  public toString(): string  {
    const datePart = this.value.toISOString().split("T")[0];
    return datePart || "";
  }

  /**
   * BaseVO exige isValid sem parâmetros.
   */
  public isValid(): boolean {
    const age = this.getAge();
    return (
      DateOfBirthVO.isValidDate(this.value) && DateOfBirthVO.isValidAge(age)
    );
  }

  /**
   * Validação estática para uso antes de criar o VO.
   */
  public static validate(input: string | Date): boolean {
    try {
      DateOfBirthVO.create(input);
      return true;
    } catch {
      return false;
    }
  }

  private static parseInput(input: string | Date): Date {
    const parsed = input instanceof Date ? new Date(input) : new Date(input);

    if (!DateOfBirthVO.isValidDate(parsed)) {
      throw new BadRequestError({
        fieldName: "dateOfBirth",
        value: input instanceof Date ? input.toISOString() : input,
        message: "Data de nascimento inválida.",
      });
    }

    return parsed;
  }

  private static isValidDate(date: Date): boolean {
    return date instanceof Date && !isNaN(date.getTime());
  }

  private static isValidAge(age: number): boolean {
    return age >= DateOfBirthVO.MIN_AGE && age <= DateOfBirthVO.MAX_AGE;
  }

  private static calculateAge(parsed: Date): number {
    const today = new Date();
    let age = today.getFullYear() - parsed.getFullYear();
    const monthDiff = today.getMonth() - parsed.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < parsed.getDate())
    ) {
      age--;
    }

    return age;
  }
}
