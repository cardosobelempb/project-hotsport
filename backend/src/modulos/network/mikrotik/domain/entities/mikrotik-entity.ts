import { BaseAggregate } from "@/common/domain/entities/base-agregate.entity";
import { Optional } from "@/common/domain/types/Optional";

import { PasswordVO } from "@/common/domain/values-objects/password/password.vo";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { MikrotikStatus } from "@/common/shared/enums/mikrotik-status.enum";

export interface MikrotikEntityProps {
  organizationId: UUIDVO;
  name: string;
  username: string;
  passwordHash: PasswordVO;
  host: string;
  port: number;
  macAddress: string;
  ipAddress: string;
  activeUser: boolean;
  status: MikrotikStatus;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export class MikrotikEntity extends BaseAggregate<MikrotikEntityProps> {
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

  get status() {
    return this.props.status;
  }

  get activeUser() {
    return this.props.activeUser;
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

  online() {
    if (this.props.status === MikrotikStatus.ONLINE) return;
    this.props.status = MikrotikStatus.ONLINE;
    this.touch();
  }

  offline() {
    if (this.props.status === MikrotikStatus.OFFLINE) return;
    this.props.status = MikrotikStatus.OFFLINE;
    this.touch();
  }

  error() {
    if (this.props.status === MikrotikStatus.ERROR) return;
    this.props.status = MikrotikStatus.ERROR;
    this.touch();
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  static create(
    props: Optional<
      MikrotikEntityProps,
      "activeUser" | "status" | "createdAt" | "updatedAt" | "deletedAt"
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
        deletedAt: null,
      },
      id,
    );
  }
}
