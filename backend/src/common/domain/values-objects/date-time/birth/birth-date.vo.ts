// ============================================================
// src/common/domain/value-objects/birth-date/birth-date.vo.ts
// Compatível com sua BaseVO atual
// ============================================================

import { BadRequestError } from "@/common/domain/errors/controllers/bad-request.error";
import { BaseVO } from "../../base.vo";

/**
 * 🎂 BirthDateVO
 *
 * Responsabilidades:
 * - Validar data de nascimento
 * - Impedir datas futuras
 * - Validar idade mínima/máxima
 * - Calcular idade
 * - Regras de maioridade
 *
 * Casos de uso:
 * - UserProfile.birthDate
 * - Lead.birthDate
 * - Validação KYC/LGPD
 * - Regras de assinatura
 */
export class BirthDateVO extends BaseVO<Date> {
  /**
   * Limites de negócio
   */
  private static readonly MIN_AGE = 0;
  private static readonly MAX_AGE = 120;
  private static readonly ADULT_AGE = 18;

  private constructor(value: Date) {
    super(value);
  }

  /**
   * ✅ Factory principal
   */
  public static create(value: Date | string): BirthDateVO {
    const normalized = new Date(value);

    if (!BirthDateVO.isValidStatic(normalized)) {
      throw new BadRequestError({
        fieldName: "birthDate",
        value: value instanceof Date ? value.toISOString() : value,
        message:
          "Invalid birth date. Date must be valid, not in the future, and age must be between 0 and 120 years.",
      });
    }

    return new BirthDateVO(normalized);
  }

  /**
   * ✅ Compatível com BaseVO
   */
  public isValid(): boolean {
    return BirthDateVO.isValidStatic(this.value);
  }

  /**
   * ✅ Pré-validação
   */
  public static validate(value: Date | string): boolean {
    return BirthDateVO.isValidStatic(new Date(value));
  }

  /**
   * ✅ Validação centralizada
   */
  private static isValidStatic(value: Date): boolean {
    return (
      BirthDateVO.isValidDate(value) &&
      !BirthDateVO.isFutureDate(value) &&
      BirthDateVO.isValidAge(value)
    );
  }

  /**
   * 📅 Data válida
   */
  private static isValidDate(date: Date): boolean {
    return date instanceof Date && !Number.isNaN(date.getTime());
  }

  /**
   * 🚫 Não permite datas futuras
   */
  private static isFutureDate(date: Date): boolean {
    return date.getTime() > Date.now();
  }

  /**
   * 👤 Faixa de idade válida
   */
  private static isValidAge(date: Date): boolean {
    const age = BirthDateVO.calculateAge(date);

    return age >= BirthDateVO.MIN_AGE && age <= BirthDateVO.MAX_AGE;
  }

  /**
   * 📊 Calcula idade
   */
  private static calculateAge(date: Date): number {
    const today = new Date();

    let age = today.getFullYear() - date.getFullYear();

    const monthDifference = today.getMonth() - date.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < date.getDate())
    ) {
      age--;
    }

    return age;
  }

  /**
   * 👤 Idade atual
   */
  public getAge(): number {
    return BirthDateVO.calculateAge(this.value);
  }

  /**
   * 🔞 Maior de idade
   */
  public isAdult(): boolean {
    return this.getAge() >= BirthDateVO.ADULT_AGE;
  }

  /**
   * 👶 Menor de idade
   */
  public isMinor(): boolean {
    return !this.isAdult();
  }

  /**
   * 📅 Já fez aniversário esse ano?
   */
  public hasBirthdayThisYear(): boolean {
    const today = new Date();

    return (
      today.getMonth() > this.value.getMonth() ||
      (today.getMonth() === this.value.getMonth() &&
        today.getDate() >= this.value.getDate())
    );
  }

  /**
   * 🎉 Próximo aniversário
   */
  public nextBirthday(): Date {
    const today = new Date();

    const nextBirthday = new Date(
      today.getFullYear(),
      this.value.getMonth(),
      this.value.getDate(),
    );

    if (nextBirthday < today) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
    }

    return nextBirthday;
  }

  /**
   * 📆 Quantos dias faltam para aniversário
   */
  public daysUntilNextBirthday(): number {
    const today = new Date();

    const nextBirthday = this.nextBirthday();

    const diff = nextBirthday.getTime() - today.getTime();

    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * 🧾 ISO Date
   */
  public toISODate(): string {
    return this.value.toISOString().split("T")[0] ?? "";
  }

  /**
   * 🇧🇷 Formato brasileiro
   */
  public toBrazilianDate(): string {
    return this.value.toLocaleDateString("pt-BR");
  }
}
