// ============================================================
// src/modules/hotspot/domain/entities/hotspot-plan.entity.ts
// ============================================================

import { BaseAggregate } from "@/common/domain/entities/base-agregate.entity";
import { Optional } from "@/common/domain/types/Optional";
import { DecimalVO } from "@/common/domain/values-objects/decimal/decimal.vo";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";

import { HotspotPlanType } from "@/common/shared/enums/hotspot-plan-type.enum";

export interface HotspotPlanProps {
  organizationId: UUIDVO;
  name: string;
  type: HotspotPlanType;
  durationSecs?: number | null;
  dataLimitMb?: number | null;
  price: DecimalVO;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export class HotspotPlanEntity extends BaseAggregate<HotspotPlanProps> {
  get organizationId() {
    return this.props.organizationId;
  }
  get name() {
    return this.props.name;
  }
  get type() {
    return this.props.type;
  }
  get durationSecs() {
    return this.props.durationSecs;
  }
  get dataLimitMb() {
    return this.props.dataLimitMb;
  }
  get price() {
    return this.props.price;
  }
  get isActive() {
    return this.props.isActive;
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

  activate(): void {
    this.props.isActive = true;
    this.touch();
  }

  deactivate(): void {
    this.props.isActive = false;
    this.touch();
  }

  softDelete(): void {
    if (!this.isDeleted()) {
      this.props.deletedAt = new Date();
      this.touch();
    }
  }

  isActivePlan(): boolean {
    return this.props.isActive && !this.isDeleted();
  }

  isDeleted(): boolean {
    return this.props.deletedAt !== null;
  }

  updatePrice(price: DecimalVO): void {
    this.props.price = price;
    this.touch();
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }

  static create(
    props: Optional<
      HotspotPlanProps,
      "createdAt" | "updatedAt" | "deletedAt" | "isActive"
    >,
    id?: UUIDVO,
  ) {
    return new HotspotPlanEntity(
      {
        ...props,
        isActive: props.isActive ?? true,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
        deletedAt: props.deletedAt ?? null,
      },
      id,
    );
  }
}
