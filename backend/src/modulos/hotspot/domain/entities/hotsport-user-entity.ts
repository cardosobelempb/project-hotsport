import { BaseAggregate } from "@/common/domain/entities/base-agregate.entity";
import { Optional } from "@/common/domain/types/Optional";

import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { HotspotUserStatusDto } from "@/shared/enums/hotspot-user-status.enum";
import { HotspotUserBlockedError } from "../errors/hotspot-user-blocked.error";

export interface HotsportUserProps {
  organizationId: UUIDVO;
  mikrotikId: UUIDVO;
  username: string;
  macAddress: string;
  ipAddress: string;
  passwordHash: string;
  status: HotspotUserStatusDto;
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
    if (this.props.status === HotspotUserStatusDto.BLOCKED) {
      throw new HotspotUserBlockedError("");
    }

    if (this.props.status === HotspotUserStatusDto.ACTIVE) return;
    this.props.status = HotspotUserStatusDto.ACTIVE;
    this.touch();
  }

  expire() {
    if (this.props.status === HotspotUserStatusDto.EXPIRED) return;
    this.props.status = HotspotUserStatusDto.EXPIRED;
    this.touch();
  }

  block() {
    if (this.props.status === HotspotUserStatusDto.BLOCKED) return;
    this.props.status = HotspotUserStatusDto.BLOCKED;
    this.touch();
  }

  pending() {
    if (this.props.status === HotspotUserStatusDto.PENDING) return;
    this.props.status = HotspotUserStatusDto.PENDING;
    this.touch();
  }

  suspended() {
    if (this.props.status === HotspotUserStatusDto.SUSPENDED) return;
    this.props.status = HotspotUserStatusDto.SUSPENDED;
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
        status: props.status ?? HotspotUserStatusDto.PENDING,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
      },
      id,
    );
  }
}
