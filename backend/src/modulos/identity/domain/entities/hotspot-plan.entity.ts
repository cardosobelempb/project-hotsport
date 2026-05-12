import { BaseEntity } from "@/common/domain/entities/base.entity";
import { Optional } from "@/common/domain/types/Optional";
import { PriceVO } from "@/common/domain/values-objects/price/price.vo";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { HotspotPlanType } from "@/common/shared/enums/hotspot-plan-type.enum";

export interface HotspotPlanProps {
  organizationId: UUIDVO;
  name: string;
  type: HotspotPlanType;
  durationSecs: number | null;
  dataLimitMb: number | null;
  price: PriceVO | null; // Decimal no Prisma → number aqui ou usar MoneyVO
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export class HotspotPlanEntity extends BaseEntity<HotspotPlanProps> {
  get isActive() {
    return this.props.isActive ?? true;
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
    this.props.deletedAt = new Date();
    this.touch();
  }

  isAvailable(): boolean {
    return this.isActive && !this.isDeleted();
  }
  isDeleted(): boolean {
    return this.props.deletedAt !== null;
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
