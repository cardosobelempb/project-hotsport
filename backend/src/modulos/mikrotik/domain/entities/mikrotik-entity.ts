import { Optional } from "@/core/domain/common/types";
import { BaseAggregate } from "@/core/domain/domain/entities/base-agregate.entity";
import { UUIDVO } from "@/core/domain/values-objects/uuidvo/uuid.vo";
import { MikrotikStatus } from "../emuns/mikrotik-status.enum";

export interface MikrotikProps {
  organizationId: UUIDVO;
  name: string;
  host: string;
  port: number;
  username: string;
  passwordHash: string;
  ipAddress: string;
  macAddress: string;
  status: MikrotikStatus;
  createdAt: Date;
  updatedAt: Date | null;
}

export class MikrotikEntity extends BaseAggregate<MikrotikProps> {
  get name() {
    return this.props.name;
  }
  get host() {
    return this.props.host;
  }
  get status() {
    return this.props.status;
  }

  get port() {
    return this.props.port;
  }

  get username() {
    return this.props.username;
  }

  get passwordHash() {
    return this.props.passwordHash;
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

  get organizationId() {
    return this.props.organizationId;
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  markOnline() {
    this.props.status = MikrotikStatus.ONLINE;
    this.touch();
  }

  markOffline() {
    this.props.status = MikrotikStatus.OFFLINE;
    this.touch();
  }

  static create(
    props: Optional<MikrotikProps, "status" | "createdAt" | "updatedAt">,
    id?: UUIDVO,
  ) {
    return new MikrotikEntity(
      {
        ...props,
        port: props.port ?? 8728,
        status: props.status ?? MikrotikStatus.OFFLINE,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: null,
      },
      id,
    );
  }
}
