import { BaseAggregate } from "@/common/domain/entities/base-agregate.entity";
import { Optional } from "@/common/domain/types/Optional";
import { IpAddressVO } from "@/common/domain/values-objects/ip-address/ip-address.vo";
import { MacAddressVO } from "@/common/domain/values-objects/mac-address/mac-address.vo";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { LgpdConsentsStatus } from "@/common/shared/enums/lgpd-consents-status.enum";

export interface LgpdConsentsProps {
  userId: UUIDVO;
  consentTerms: boolean;
  consentMarketing: boolean;
  consentDataSharing: boolean;
  consentAnalytics: boolean;
  ipAddress: IpAddressVO;
  macAddress: MacAddressVO;
  userAgent: string;
  status: LgpdConsentsStatus;
  consentVersion: string;
  withdrawnAt: Date | null;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export class LgpdConsentsEntity extends BaseAggregate<LgpdConsentsProps> {
  get userId() {
    return this.props.userId;
  }

  get consentTerms() {
    return this.props.consentTerms;
  }

  get consentMarketing() {
    return this.props.consentMarketing;
  }

  get consentDataSharing() {
    return this.props.consentDataSharing;
  }

  get consentAnalytics() {
    return this.props.consentAnalytics;
  }

  get ipAddress() {
    return this.props.ipAddress;
  }

  get macAddress() {
    return this.props.macAddress;
  }

  get userAgent() {
    return this.props.userAgent;
  }

  get status() {
    return this.props.status;
  }

  get consentVersion() {
    return this.props.consentVersion;
  }

  get withdrawnAt() {
    return this.props.withdrawnAt;
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
      LgpdConsentsProps,
      "status" | "createdAt" | "updatedAt" | "deletedAt" | "withdrawnAt"
    >,
    id?: UUIDVO,
  ) {
    return new LgpdConsentsEntity(
      {
        ...props,
        status: props.status ?? LgpdConsentsStatus.ACTIVE,
        withdrawnAt: props.withdrawnAt ?? null,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
        deletedAt: props.deletedAt ?? null,
      },
      id,
    );
  }
}
