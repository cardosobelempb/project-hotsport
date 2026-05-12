import { BaseAggregate } from "@/common/domain/entities/base-agregate.entity";
import { Optional } from "@/common/domain/types/Optional";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";

export interface OtpProps {
  userId: UUIDVO | null;
  phone: string;
  codeHash: string;
  expiredAt: Date;
  attempts: number;
  usedAt: Date | null;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export class OtpEntity extends BaseAggregate<OtpProps> {
  get userId() {
    return this.props.userId;
  }

  get phone() {
    return this.props.phone;
  }

  get codeHash() {
    return this.props.codeHash;
  }

  get expiredAt() {
    return this.props.expiredAt;
  }

  get attempts() {
    return this.props.attempts;
  }

  get usedAt() {
    return this.props.usedAt;
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
    this.props.updatedAt = new Date();
  }
  static create(
    props: Optional<
      OtpProps,
      "attempts" | "createdAt" | "updatedAt" | "deletedAt" | "usedAt"
    >,
    id?: UUIDVO,
  ) {
    return new OtpEntity(
      {
        ...props,
        attempts: props.attempts ?? 0,
        usedAt: props.usedAt ?? null,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
        deletedAt: props.deletedAt ?? null,
      },
      id,
    );
  }
}
