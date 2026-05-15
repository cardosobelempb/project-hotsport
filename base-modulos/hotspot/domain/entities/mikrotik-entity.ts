// ============================================================
// src/modules/mikrotik/domain/entities/mikrotik.entity.ts
// ============================================================

import { BaseAggregate } from "@/common/domain/entities/base-agregate.entity";
import { Optional } from "@/common/domain/types/Optional";
import { IpAddressVO } from "@/common/domain/values-objects/ip-address/ip-address.vo";
import { MacAddressVO } from "@/common/domain/values-objects/mac-address/mac-address.vo";
import { PasswordVO } from "@/common/domain/values-objects/password/password.vo";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";

import { MikrotikStatus } from "@/common/shared/enums/mikrotik-status.enum";

export interface MikrotikProps {
  organizationId: UUIDVO;
  name: string;
  host: string;
  port: number;
  macAddress: MacAddressVO;
  ipAddress: IpAddressVO;
  username: string;
  passwordHash: PasswordVO;
  activeUser: boolean;
  status: MikrotikStatus;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export class MikrotikEntity extends BaseAggregate<MikrotikProps> {
  get organizationId() {
    return this.props.organizationId;
  }
  get name() {
    return this.props.name;
  }
  get host() {
    return this.props.host;
  }
  get port() {
    return this.props.port;
  }
  get macAddress() {
    return this.props.macAddress;
  }
  get ipAddress() {
    return this.props.ipAddress;
  }
  get username() {
    return this.props.username;
  }
  get passwordHash() {
    return this.props.passwordHash;
  }
  get activeUser() {
    return this.props.activeUser;
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
  get deletedAt() {
    return this.props.deletedAt;
  }

  activate(): void {
    if (this.status !== MikrotikStatus.ONLINE) {
      this.props.status = MikrotikStatus.ONLINE;
      this.touch();
    }
  }

  deactivate(): void {
    this.props.status = MikrotikStatus.OFFLINE;
    this.touch();
  }

  setError(): void {
    this.props.status = MikrotikStatus.ERROR;
    this.touch();
  }

  softDelete(): void {
    if (!this.isDeleted()) {
      this.props.deletedAt = new Date();
      this.touch();
    }
  }

  restore(): void {
    this.props.deletedAt = null;
    this.touch();
  }

  isOnline(): boolean {
    return this.status === MikrotikStatus.ONLINE && !this.isDeleted();
  }

  isDeleted(): boolean {
    return this.props.deletedAt !== null;
  }

  updateHost(host: string): void {
    this.props.host = host;
    this.touch();
  }

  updateCredentials(username: string, passwordHash: string): void {
    this.props.username = username;
    this.props.passwordHash = PasswordVO.create(passwordHash);
    this.touch();
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }

  static create(
    props: Optional<
      MikrotikProps,
      "createdAt" | "updatedAt" | "deletedAt" | "activeUser" | "status"
    >,
    id?: UUIDVO,
  ) {
    return new MikrotikEntity(
      {
        ...props,
        activeUser: props.activeUser ?? false,
        status: props.status ?? MikrotikStatus.OFFLINE,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
        deletedAt: props.deletedAt ?? null,
      },
      id,
    );
  }
}
