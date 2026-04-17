import { Optional } from "@/core/domain/common/types";
import { BaseAggregate } from "@/core/domain/domain/entities/base-agregate.entity";
import { UUIDVO } from "@/core/domain/values-objects/uuidvo/uuid.vo";
import { VoucherStatus } from "../emuns/voucher-status.enum";
import { InvalidVoucherTransitionError } from "../errors/invalid-voucher-transition.error";
import { VoucherExpiredError } from "../errors/voucher-expired.error";

export interface VoucherProps {
  organizationId: UUIDVO;
  planId: UUIDVO;
  code: string;
  status: VoucherStatus;
  mikrotikId: UUIDVO;
  usedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export class VoucherEntity extends BaseAggregate<VoucherProps> {
  get code() {
    return this.props.code;
  }

  get status() {
    return this.props.status;
  }

  get usedAt() {
    return this.props.usedAt;
  }

  get expiresAt() {
    return this.props.expiresAt;
  }

  get organizationId() {
    return this.props.organizationId;
  }

  get mikrotikId() {
    return this.props.mikrotikId;
  }

  get planId() {
    return this.props.planId;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  get deletedAt() {
    return this.props.deletedAt;
  }

  get isExpired() {
    return this.props.expiresAt ? this.props.expiresAt < new Date() : false;
  }

  get isUsed() {
    return !!this.props.usedAt;
  }

  get isActive() {
    return this.props.status === VoucherStatus.ACTIVE;
  }

  get isRevoked() {
    return this.props.status === VoucherStatus.REVOKED;
  }

  activate() {
    if (this.props.status !== VoucherStatus.ACTIVE) {
      throw new InvalidVoucherTransitionError("");
    }

    if (this.props.expiresAt && this.props.expiresAt < new Date()) {
      throw new VoucherExpiredError("");
    }

    this.props.status = VoucherStatus.ACTIVE;
    this.touch();
  }

  used() {
    if (this.props.status !== VoucherStatus.ACTIVE) {
      throw new InvalidVoucherTransitionError("");
    }

    this.props.usedAt = new Date();
    this.touch();
  }

  revoke() {
    if (this.props.status === VoucherStatus.REVOKED) return;
    this.props.status = VoucherStatus.REVOKED;
    this.touch();
  }

  expire() {
    if (this.props.status === VoucherStatus.EXPIRED) return;
    this.props.status = VoucherStatus.EXPIRED;
    this.touch();
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  static create(
    props: Optional<
      VoucherProps,
      | "status"
      | "usedAt"
      | "expiresAt"
      | "createdAt"
      | "updatedAt"
      | "deletedAt"
    >,
    id?: UUIDVO,
  ) {
    return new VoucherEntity(
      {
        ...props,
        status: props.status ?? VoucherStatus.UNUSED,
        usedAt: props.usedAt ?? null,
        expiresAt: props.expiresAt ?? null,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
        deletedAt: props.deletedAt ?? null,
      },
      id,
    );
  }
}
