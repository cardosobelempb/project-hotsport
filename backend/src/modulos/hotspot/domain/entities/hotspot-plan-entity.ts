import { Optional } from "@/core/domain/common/types";
import { BaseAggregate } from "@/core/domain/domain/entities/base-agregate.entity";
import { UUIDVO } from "@/core/domain/values-objects/uuidvo/uuid.vo";
import { HotspotPlanType } from "../enums/hotsport-plan.enuns";

export interface HotspotPlanProps {
  id: UUIDVO;
  organizationId: UUIDVO;
  name: string;
  duratioSec: number;
  dataLimitMb: number;
  type: HotspotPlanType;
  createdAt: Date;
  updatedAt: Date | null;
}

export class HotspotPlanEntity extends BaseAggregate<HotspotPlanProps> {
  get organizationId() {
    return this.props.organizationId;
  }

  get name() {
    return this.props.name;
  }

  get duratioSec() {
    return this.props.duratioSec;
  }

  get dataLimitMb() {
    return this.props.dataLimitMb;
  }

  get type() {
    return this.props.type;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  public update(
    props: Optional<HotspotPlanProps, "organizationId" | "createdAt">,
  ) {
    if (props.name) this.props.name = props.name;
    if (props.duratioSec) this.props.duratioSec = props.duratioSec;
    if (props.dataLimitMb) this.props.dataLimitMb = props.dataLimitMb;
    if (props.type) this.props.type = props.type;

    this.touch();
  }

  public changeType(type: HotspotPlanType) {
    if (this.props.type === type) return;

    this.props.type = type;
    this.touch();
  }

  static create(
    props: Optional<HotspotPlanProps, "type" | "createdAt" | "updatedAt">,
    id?: UUIDVO,
  ) {
    return new HotspotPlanEntity(
      {
        ...props,
        type: props.type ?? HotspotPlanType.TIME,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: null,
      },
      id,
    );
  }
}
