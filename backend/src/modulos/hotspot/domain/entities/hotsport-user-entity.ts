import { Optional } from "@/core/domain/common/types";
import { BaseAggregate } from "@/core/domain/domain/entities/base-agregate.entity";
import { UUIDVO } from "@/core/domain/values-objects/uuidvo/uuid.vo";
import { HotspotUserStatus } from "../enums/hotsport-user-status.enum";
import { HotspotUserBlockedError } from "../errors/hotspot-user-blocked.error";

export interface HotsportUserProps {
  organizationId: UUIDVO;
  mikrotikId: UUIDVO;
  username: string;
  macAddress: string;
  ipAddress: string;
  passwordHash: string;
  status: HotspotUserStatus;
  createdAt: Date;
  updatedAt: Date | null;
}

export class HotsportUserEntity extends BaseAggregate<HotsportUserProps> {
  get organizationId() {
    return this.props.organizationId;
  }

  get mikrotikId() {
    return this.props.mikrotikId;
  }

  get username() {
    return this.props.username;
  }

  get macAddress() {
    return this.props.macAddress;
  }

  get ipAddress() {
    return this.props.ipAddress;
  }

  get passwordHash() {
    return this.props.passwordHash;
  }

  get status() {
    return this.props.status;
  }
  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }
  activate() {
    if (this.props.status === HotspotUserStatus.BLOCKED) {
      throw new HotspotUserBlockedError("");
    }

    if (this.props.status === HotspotUserStatus.ACTIVE) return;
    this.props.status = HotspotUserStatus.ACTIVE;
    this.touch();
  }

  expire() {
    if (this.props.status === HotspotUserStatus.EXPIRED) return;
    this.props.status = HotspotUserStatus.EXPIRED;
    this.touch();
  }

  block() {
    if (this.props.status === HotspotUserStatus.BLOCKED) return;
    this.props.status = HotspotUserStatus.BLOCKED;
    this.touch();
  }

  pending() {
    if (this.props.status === HotspotUserStatus.PENDING) return;
    this.props.status = HotspotUserStatus.PENDING;
    this.touch();
  }

  suspended() {
    if (this.props.status === HotspotUserStatus.SUSPENDED) return;
    this.props.status = HotspotUserStatus.SUSPENDED;
    this.touch();
  }

  updateSessionNetwork(params: {
    macAddress?: string;
    ipAddress?: string;
    passwordHash?: string;
  }) {
    if (params.macAddress !== undefined)
      this.props.macAddress = params.macAddress;
    if (params.ipAddress !== undefined) this.props.ipAddress = params.ipAddress;
    if (params.passwordHash !== undefined)
      this.props.passwordHash = params.passwordHash;
    this.touch();
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  static create(
    props: Optional<HotsportUserProps, "status" | "createdAt" | "updatedAt">,
    id?: UUIDVO,
  ) {
    return new HotsportUserEntity(
      {
        ...props,
        status: props.status ?? HotspotUserStatus.PENDING,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
      },
      id,
    );
  }
}
