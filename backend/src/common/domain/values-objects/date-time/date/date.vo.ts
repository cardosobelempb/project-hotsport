import { BadRequestError } from "@/common/domain/errors/controllers/bad-request.error";
import { BaseDateVO } from "./base-date.vo";

export class DateVO extends BaseDateVO {
  protected readonly value: Date;

  constructor(dateString: string) {
    super();
    this.value = this.validate(dateString);
  }

  protected validate(dateString: string): Date {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new BadRequestError({
        fieldName: "date",
        value: dateString,
        message: "Invalid date format. Use YYYY-MM-DD.",
      });
    }

    const iso = dateString.split("T")[0] || "";
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(iso)) {
      throw new BadRequestError({
        fieldName: "date",
        value: dateString,
        message: "Invalid date format. Use YYYY-MM-DD.",
      });
    }

    return new Date(iso); // strips time
  }

  getValue(): string {
    return this.value.toISOString().split("T")[0] ?? "";
  }

  getDate(): Date {
    return this.value;
  }

  toString(): string {
    return this.getValue();
  }

  equals(other: DateVO): boolean {
    return this.getValue() === other.getValue();
  }
}
