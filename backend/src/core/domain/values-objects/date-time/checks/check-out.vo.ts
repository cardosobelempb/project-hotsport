import { BadRequestError } from "@/core/domain/errors/controllers/BadRequestError";
import { BaseChecks } from "./base-checks.vo";
import { CheckInVO } from "./check-in.vo";

export class CheckOutVO extends BaseChecks {
  private constructor(input: Date | string) {
    super(input);
  }

  /**
   * Cria uma instância de CheckOutVO e valida contra o check-in, se fornecido
   */
  public static create(input: Date | string, checkIn?: CheckInVO): CheckOutVO {
    const instance = new CheckOutVO(input);

    if (checkIn && instance.isBefore(checkIn)) {
      throw new BadRequestError(
        "Check-out date cannot be earlier than check-in date.",
      );
    }

    return instance;
  }

  /**
   * Verifica se a data de check-out é anterior a hoje
   */
  public isPast(): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.toDate().getTime() < today.getTime();
  }

  /**
   * Verifica se a data de check-out é posterior a hoje
   */
  public isFuture(): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.toDate().getTime() > today.getTime();
  }
}
