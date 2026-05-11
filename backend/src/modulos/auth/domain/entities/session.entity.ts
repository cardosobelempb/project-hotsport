import { BaseAggregate } from "@/common/domain/entities/base-agregate.entity";
import { Optional } from "@/common/domain/types/Optional";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";

export interface SessionProps {
  sessionToken: string;
  userId: UUIDVO;
  expireAt: Date;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export class SessionEntity extends BaseAggregate<SessionProps> {
  get sessionToken() {
    return this.props.sessionToken;
  }

  get userId() {
    return this.props.userId;
  }

  get sessionId() {
    return this.props.userId;
  }

  get expireAt() {
    return this.props.expireAt;
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

  private touch() {
    this.props.expireAt = new Date();
  }

  static create(
    props: Optional<SessionProps, "createdAt" | "deletedAt" | "updatedAt">,
    id?: UUIDVO,
  ) {
    return new SessionEntity(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        deletedAt: props.deletedAt ?? null,
        updatedAt: props.updatedAt ?? null,
      },
      id,
    );
  }
}
