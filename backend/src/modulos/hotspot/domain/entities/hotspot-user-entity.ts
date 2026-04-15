import { Optional } from "@/core/domain/common/types";
import { BaseAggregate } from "@/core/domain/domain/entities/base-agregate.entity";
import { UUIDVO } from "@/core/domain/values-objects/uuidvo/uuid.vo";
import { HotspotUserStatus } from "../enums/hotsport-user-status.enum";

export interface HotspotUserProps {
  organizationId: UUIDVO;
  mikrotikId: UUIDVO;
  username: string;
  passwordHash: string;
  macAddress: string;
  ipAddress: string;
  status: HotspotUserStatus;
  createdAt: Date;
  updatedAt: Date | null;
}

export class HotspotUserEntity extends BaseAggregate<HotspotUserProps> {
  get organizationId() {
    return this.props.organizationId;
  }

  get username() {
    return this.props.username;
  }

  get status() {
    return this.props.status;
  }

  get ipAddress() {
    return this.props.ipAddress;
  }

  get macAddress() {
    return this.props.macAddress;
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

  activate() {
    if (this.props.status === HotspotUserStatus.ACTIVE) return;

    this.props.status = HotspotUserStatus.ACTIVE;
    this.touch();
  }

  block() {
    this.props.status = HotspotUserStatus.BLOCKED;
    this.touch();
  }

  expire() {
    this.props.status = HotspotUserStatus.EXPIRED;
    this.touch();
  }

  static create(
    props: Optional<HotspotUserProps, "status" | "createdAt" | "updatedAt">,
    id?: UUIDVO,
  ) {
    return new HotspotUserEntity(
      {
        ...props,
        status: props.status ?? HotspotUserStatus.PENDING,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: null,
      },
      id,
    );
  }
}
