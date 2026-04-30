import { BaseAggregate } from "@/common/domain/entities/base-agregate.entity";
import { Optional } from "@/common/domain/types/Optional";
import { PhoneVO } from "@/common/domain/values-objects/phone/phone.vo";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";

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
