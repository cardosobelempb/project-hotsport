import { BaseAggregate } from "@/common/domain/entities/base-agregate.entity";
import { Optional } from "@/common/domain/types/Optional";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";

export interface VerificationTokenProps {
  identifier: UUIDVO;
  tokenHash: string;
  expiredAt: Date;
  usedAt: Date | null;
}

export class VerificationTokenEntity extends BaseAggregate<VerificationTokenProps> {
  get identifier() {
    return this.props.identifier;
  }

  get tokenHash() {
    return this.props.tokenHash;
  }

  get expiredAt() {
    return this.props.expiredAt;
  }

  get usedAt() {
    return this.props.usedAt;
  }

  static create(
    props: Optional<VerificationTokenProps, "usedAt">,
    id?: UUIDVO,
  ) {
    return new VerificationTokenEntity(
      {
        ...props,

        usedAt: props.usedAt ?? null,
      },
      id,
    );
  }
}
