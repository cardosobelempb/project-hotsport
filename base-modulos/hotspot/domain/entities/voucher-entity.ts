// ============================================================
// src/modules/hotspot/domain/entities/voucher.entity.ts
// ============================================================

import { BaseAggregate } from "@/common/domain/entities/base-agregate.entity";
import { Optional } from "@/common/domain/types/Optional";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { VoucherStatus } from "@/common/shared/enums/voucher-status.enum";

export interface VoucherProps {
  organizationId: UUIDVO | null;
  mikrotikId: UUIDVO | null;
  hotspotPlanId: UUIDVO | null;
  code: string;
  status: VoucherStatus;
  usedAt: Date | null;
  expiredAt: Date | null;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export class VoucherEntity extends BaseAggregate<VoucherProps> {
  get organizationId() {
    return this.props.organizationId;
  }
  get mikrotikId() {
    return this.props.mikrotikId;
  }
  get hotspotPlanId() {
    return this.props.hotspotPlanId;
  }
  get code() {
    return this.props.code;
  }
  get status() {
    return this.props.status;
  }
  get usedAt() {
    return this.props.usedAt;
  }
  get expiredAt() {
    return this.props.expiredAt;
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

  redeem(usedAt: Date): void {
    if (this.status === VoucherStatus.UNUSED) {
      this.props.status = VoucherStatus.USED;
      this.props.usedAt = usedAt;
      this.touch();
    }
  }

  expire(): void {
    if (this.status === VoucherStatus.UNUSED) {
      this.props.status = VoucherStatus.EXPIRED;
      this.props.expiredAt = new Date();
      this.touch();
    }
  }

  revoke(): void {
    this.props.status = VoucherStatus.REVOKED;
    this.touch();
  }

  softDelete(): void {
    if (!this.isDeleted()) {
      this.props.deletedAt = new Date();
      this.touch();
    }
  }

  isAvailable(): boolean {
    return (
      this.status === VoucherStatus.UNUSED &&
      !this.isExpired() &&
      !this.isDeleted()
    );
  }

  isExpired(): boolean {
    return (
      this.props.expiredAt !== null ||
      this.props.status === VoucherStatus.EXPIRED
    );
  }

  isDeleted(): boolean {
    return this.props.deletedAt !== null;
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }

  static create(
    props: Optional<
      VoucherProps,
      | "createdAt"
      | "updatedAt"
      | "deletedAt"
      | "usedAt"
      | "expiredAt"
      | "status"
    >,
    id?: UUIDVO,
  ) {
    return new VoucherEntity(
      {
        ...props,
        status: props.status ?? VoucherStatus.UNUSED,
        usedAt: props.usedAt ?? null,
        expiredAt: props.expiredAt ?? null,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
        deletedAt: props.deletedAt ?? null,
      },
      id,
    );
  }
}
