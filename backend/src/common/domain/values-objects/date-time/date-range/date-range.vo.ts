// ============================================================
// src/common/domain/value-objects/date-range.vo.ts
// Compatível com sua BaseVO atual
// ============================================================

import { BadRequestError } from "@/common/domain/errors/controllers/bad-request.error";
import { BaseVO } from "../../base.vo";

export interface DateRangeValue {
  startDate: Date;
  endDate: Date;
}

/**
 * 📅 DateRangeVO - Representa intervalo entre duas datas
 */
export class DateRangeVO extends BaseVO<DateRangeValue> {
  private constructor(value: DateRangeValue) {
    super(value);
  }

  public static create(
    startDate: Date | string,
    endDate: Date | string,
  ): DateRangeVO {
    const normalized: DateRangeValue = {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    };

    if (!DateRangeVO.isValidStatic(normalized)) {
      throw new BadRequestError({
        fieldName: "dateRange",
        message:
          "Invalid date range. Start date must be before or equal to end date.",
      });
    }

    return new DateRangeVO(normalized);
  }

  private static isValidStatic(value: DateRangeValue): boolean {
    return (
      DateRangeVO.isValidDate(value.startDate) &&
      DateRangeVO.isValidDate(value.endDate) &&
      value.startDate.getTime() <= value.endDate.getTime()
    );
  }

  public isValid(): boolean {
    return DateRangeVO.isValidStatic(this.value);
  }

  public static validate(
    startDate: Date | string,
    endDate: Date | string,
  ): boolean {
    return DateRangeVO.isValidStatic({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });
  }

  private static isValidDate(date: Date): boolean {
    return date instanceof Date && !Number.isNaN(date.getTime());
  }

  public get startDate(): Date {
    return this.value.startDate;
  }

  public get endDate(): Date {
    return this.value.endDate;
  }

  public durationInMilliseconds(): number {
    return this.endDate.getTime() - this.startDate.getTime();
  }

  public durationInSeconds(): number {
    return Math.floor(this.durationInMilliseconds() / 1000);
  }

  public durationInMinutes(): number {
    return Math.floor(this.durationInSeconds() / 60);
  }

  public durationInHours(): number {
    return Math.floor(this.durationInMinutes() / 60);
  }

  public durationInDays(): number {
    return Math.floor(this.durationInHours() / 24);
  }

  public contains(date: Date | string): boolean {
    const target = new Date(date);

    if (!DateRangeVO.isValidDate(target)) {
      return false;
    }

    return (
      target.getTime() >= this.startDate.getTime() &&
      target.getTime() <= this.endDate.getTime()
    );
  }

  public overlaps(other: DateRangeVO): boolean {
    return (
      this.startDate.getTime() <= other.endDate.getTime() &&
      other.startDate.getTime() <= this.endDate.getTime()
    );
  }

  public isExpired(referenceDate: Date = new Date()): boolean {
    return this.endDate.getTime() < referenceDate.getTime();
  }

  public isActive(referenceDate: Date = new Date()): boolean {
    return this.contains(referenceDate);
  }
}
