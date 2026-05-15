import { BaseEntity } from "@/common/domain/entities/base.entity";
import { Optional } from "@/common/domain/types/Optional";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";

export interface SessionProps {
  userId: UUIDVO;
  sessionToken: string;
  expires: Date;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export class SessionEntity extends BaseEntity<SessionProps> {
  get userId() {
    return this.props.userId;
  }
  get expires() {
    return this.props.expires;
  }

  get sessionToken() {
    return this.props.sessionToken;
  }

  get ipAddress() {
    return this.props.ipAddress;
  }

  get userAgent() {
    return this.props.userAgent;
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

  isExpired(): boolean {
    return new Date() > this.props.expires;
  }

  revoke(): void {
    this.props.expires = new Date(Date.now() - 1000);
    this.touch();
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }

  static create(
    props: Optional<SessionProps, "createdAt" | "updatedAt" | "deletedAt">,
    id?: UUIDVO,
  ) {
    return new SessionEntity(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
        deletedAt: props.deletedAt ?? null,
      },
      id,
    );
  }
}
