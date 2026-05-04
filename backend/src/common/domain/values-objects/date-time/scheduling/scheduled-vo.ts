import { BadRequestError } from "@/common/domain/errors/controllers/bad-request.error";
import { BaseScheduled } from "./base-scheduled";

let Dayjs: any;
let dayjs: any;
try {
  Dayjs = require("dayjs");
  dayjs = require("dayjs");
} catch {
  Dayjs = null;
  dayjs = null;
}

export class ScheduledVO extends BaseScheduled {
  protected date: typeof Dayjs;

  constructor(input: string | Date | typeof Dayjs) {
    super();

    // Valida a data de entrada
    const parsed = this.validateDate(input); // Usa a validação da classe abstrata

    // Verifica se a data está dentro do intervalo permitido
    const now = dayjs();
    if (!this.isValidSchedule(parsed.valueOf(), now.valueOf())) {
      throw new BadRequestError({
        fieldName: "scheduledDate",
        value: input instanceof Date ? input.toISOString() : input,
        message:
          "Data de agendamento deve ser futura e não mais de um ano no futuro.",
      });
    }

    this.date = parsed;
  }

  getValue(): typeof Dayjs {
    return this.date;
  }

  toString(): string {
    return this.date.format("YYYY-MM-DD HH:mm");
  }

  isValid(): boolean {
    const now = dayjs();
    return (
      this.date.isValid() &&
      this.isValidSchedule(this.date.valueOf(), now.valueOf())
    );
  }
}
