import { Optional } from "@/core/domain/common/types";
import { BaseAggregate } from "@/core/domain/domain/entities/base-agregate.entity";
import { PhoneVO } from "@/core/domain/values-objects/phone/phone.vo";
import { UUIDVO } from "@/core/domain/values-objects/uuidvo/uuid.vo";

export interface OtpProps {
  phone: PhoneVO;
  codeHash: string;
  expiresAt: Date;
  attempts: number;
  usedAt?: Date | null;
  createdAt: Date;
}

export class OtpEntity extends BaseAggregate<OtpProps> {
  isExpired(): boolean {
    return new Date() > this.props.expiresAt;
  }

  markAsUsed() {
    if (this.isExpired()) {
      throw new Error("OTP expirado");
    }

    this.props.usedAt = new Date();
  }

  incrementAttempts() {
    this.props.attempts += 1;
  }

  static create(
    props: Optional<OtpProps, "attempts" | "createdAt">,
    id?: UUIDVO,
  ) {
    return new OtpEntity(
      {
        ...props,
        attempts: props.attempts ?? 0,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );
  }
}
