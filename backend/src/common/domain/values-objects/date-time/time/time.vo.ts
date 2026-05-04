import { BadRequestError } from "@/common/domain/errors/controllers/bad-request.error";
import { AbstractTimeVO } from "./base-time.vo";

export class TimeVO extends AbstractTimeVO {
  protected readonly value: string;

  constructor(time: string) {
    super();
    this.value = this.validate(time);
  }

  protected validate(time: string): string {
    const regex = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (!regex.test(time)) {
      throw new BadRequestError({
        fieldName: "time",
        message: "Time must be in the format HH:mm (24-hour format)",
      });
    }
    return time;
  }

  getValue(): string {
    return this.value;
  }

  getHours(): number {
    return parseInt(this.value.split(":")[0] ?? "0", 10);
  }

  getMinutes(): number {
    return parseInt(this.value.split(":")[1] ?? "0", 10);
  }

  toString(): string {
    return this.value;
  }

  equals(other: TimeVO): boolean {
    return this.value === other.getValue();
  }
}
