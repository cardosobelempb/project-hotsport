import { Optional } from "@/core/domain/common/types";
import { BaseAggregate } from "@/core/domain/domain/entities/base-agregate.entity";
import { UUIDVO } from "@/core/domain/values-objects/uuidvo/uuid.vo";
import { MikrotikStatus } from "../emuns/mikrotik-status.enum";

export interface MikrotikProps {
  organizationId: UUIDVO;
  name: string;
  host: string;
  port: number;
  macAddress: string;
  ipAddress: string;
  username: string;
  passwordHash: string;
  status: MikrotikStatus;
  createdAt: Date;
  updatedAt: Date | null;
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

  get status() {
    return this.props.status;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  markOnline() {
    if (this.props.status === MikrotikStatus.ONLINE) return;
    this.props.status = MikrotikStatus.ONLINE;
    this.touch();
  }

  markOffline() {
    if (this.props.status === MikrotikStatus.OFFLINE) return;
    this.props.status = MikrotikStatus.OFFLINE;
    this.touch();
  }

  markError() {
    if (this.props.status === MikrotikStatus.ERROR) return;
    this.props.status = MikrotikStatus.ERROR;
    this.touch();
  }

  updateConnection(params: {
    name?: string;
    host?: string;
    port?: number;
    macAddress?: string;
    ipAddress?: string;
    username?: string;
    passwordHash?: string;
  }) {
    if (params.name !== undefined) this.props.name = params.name;
    if (params.host !== undefined) this.props.host = params.host;
    if (params.port !== undefined) this.props.port = params.port;
    if (params.macAddress !== undefined)
      this.props.macAddress = params.macAddress;
    if (params.ipAddress !== undefined) this.props.ipAddress = params.ipAddress;
    if (params.username !== undefined) this.props.username = params.username;
    if (params.passwordHash !== undefined)
      this.props.passwordHash = params.passwordHash;
    this.touch();
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  static create(
    props: Optional<
      MikrotikProps,
      "port" | "status" | "createdAt" | "updatedAt"
    >,
    id?: UUIDVO,
  ) {
    return new MikrotikEntity(
      {
        ...props,
        port: props.port ?? 8728,
        status: props.status ?? MikrotikStatus.OFFLINE,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
      },
      id,
    );
  }
}
