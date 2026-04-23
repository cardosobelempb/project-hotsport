import { BaseAggregate } from "@/common/domain/entities/base-agregate.entity";
import { Optional } from "@/common/domain/types/Optional";
import { UUIDVO } from "@/common/domain/values-objects";
import { HotspotPlanType } from "../enums/hotsport-plan.enuns";

export interface HotsportPlanProps {
  organizationId: UUIDVO;
  name: string;
  type: HotspotPlanType;
  durationSecs: number | null;
  dataLimitMb: number | null;
  createdAt: Date;
  updatedAt: Date | null;
}

export class HotsportPlanEntity extends BaseAggregate<HotsportPlanProps> {
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

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  rename(name: string) {
    this.props.name = name;
    this.touch();
  }

  changeToTime(durationSecs: number) {
    this.props.type = HotspotPlanType.TIME;
    this.props.durationSecs = durationSecs;
    this.props.dataLimitMb = null;
    this.touch();
  }

  changeToData(dataLimitMb: number) {
    this.props.type = HotspotPlanType.DATA;
    this.props.dataLimitMb = dataLimitMb;
    this.props.durationSecs = null;
    this.touch();
  }

  changeToUnlimited() {
    this.props.type = HotspotPlanType.UNLIMITED;
    this.props.durationSecs = null;
    this.props.dataLimitMb = null;
    this.touch();
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  static create(
    props: Optional<
      HotsportPlanProps,
      "type" | "durationSecs" | "dataLimitMb" | "createdAt" | "updatedAt"
    >,
    id?: UUIDVO,
  ) {
    return new HotsportPlanEntity(
      {
        ...props,
        type: props.type ?? HotspotPlanType.TIME,
        durationSecs: props.durationSecs ?? null,
        dataLimitMb: props.dataLimitMb ?? null,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
      },
      id,
    );
  }
}
