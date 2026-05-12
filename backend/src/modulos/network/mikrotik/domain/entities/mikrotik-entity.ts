import { BaseAggregate } from "@/common/domain/entities/base-agregate.entity";
import { Optional } from "@/common/domain/types/Optional";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { MikrotikStatus } from "@/common/shared/enums/mikrotik-status.enum";

export interface MikrotikProps {
  organizationId: UUIDVO;
  name: string;
  host: string;
  port: number;
  username: string;
  passwordHash: string;
  status?: MikrotikStatus;
  activeUser: boolean;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export class MikrotikEntity extends BaseAggregate<MikrotikProps> {
  get organizationId() {
    return this.props.organizationId;
  }
  get status() {
    return this.props.status ?? MikrotikStatus.OFFLINE;
  }

  markOnline(): void {
    this.props.status = MikrotikStatus.ONLINE;
    this.touch();
  }
  markOffline(): void {
    this.props.status = MikrotikStatus.OFFLINE;
    this.touch();
  }
  markError(): void {
    this.props.status = MikrotikStatus.ERROR;
    this.touch();
  }

  softDelete(): void {
    this.props.deletedAt = new Date();
    this.touch();
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }

  static create(
    props: Optional<
      MikrotikProps,
      "createdAt" | "updatedAt" | "deletedAt" | "status"
    >,
    id?: UUIDVO,
  ) {
    return new MikrotikEntity(
      {
        ...props,
        status: props.status ?? MikrotikStatus.OFFLINE,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
        deletedAt: props.deletedAt ?? null,
      },
      id,
    );
  }
}
