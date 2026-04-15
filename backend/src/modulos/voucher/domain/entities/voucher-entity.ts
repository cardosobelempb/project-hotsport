import { Optional } from "@/core/domain/common/types";
import { BaseAggregate } from "@/core/domain/domain/entities/base-agregate.entity";
import { UUIDVO } from "@/core/domain/values-objects/uuidvo/uuid.vo";
import { VoucherStatus } from "../emuns/voucher-status.enum";

export interface VoucherProps {
  code: string;
  status: VoucherStatus;
  expiresAt?: Date | null;
  usedAt?: Date | null;
  createdAt: Date;
}

export class VoucherEntity extends BaseAggregate<VoucherProps> {
  get code() {
    return this.props.code;
  }
  get status() {
    return this.props.status;
  }

  use() {
    if (this.props.status !== VoucherStatus.UNUSED) {
      throw new Error("Voucher já utilizado ou inválido");
    }

    this.props.status = VoucherStatus.ACTIVE;
    this.props.usedAt = new Date();
  }

  expire() {
    this.props.status = VoucherStatus.EXPIRED;
  }

  static create(
    props: Optional<VoucherProps, "status" | "createdAt">,
    id?: UUIDVO,
  ) {
    return new VoucherEntity(
      {
        ...props,
        status: props.status ?? VoucherStatus.UNUSED,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );
  }
}
