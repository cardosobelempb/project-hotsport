import { BaseAggregate } from "@/common/domain/entities/base-agregate.entity";
import { Optional } from "@/common/domain/types/Optional";
import { ConsentMustAcceptTermsError } from "@/modulos/voucher/domain/errors/consent-must-accept-terms.error";

import { UUIDVO } from "@/common/domain/values-objects";
import { LgpdConsentStatus } from "../enums/lgpd-consent-status.enum";

export interface LgpdConsentProps {
  userId: UUIDVO;
  organizationId: UUIDVO;
  consentTerms: boolean;
  consentMarketing: boolean;
  consentDataSharing: boolean;
  consentAnalytics: boolean;
  ipAddress: string;
  macAddress: string;
  userAgent: string;
  consentVersion: string;
  status: LgpdConsentStatus;
  withdrawnAt?: Date | null;
  createdAt: Date;
  updatedAt: Date | null;
}

export class LgpdConsentEntity extends BaseAggregate<LgpdConsentProps> {
  get userId() {
    return this.props.userId;
  }

  get organizationId() {
    return this.props.organizationId;
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

  get consentVersion() {
    return this.props.consentVersion;
  }

  get status() {
    return this.props.status;
  }

  get withdrawnAt() {
    return this.props.withdrawnAt;
  }

  get createdAt(): Date {
    return this.createdAt;
  }

  get updatedAt(): Date | null {
    return this.updatedAt;
  }

  revoke() {
    if (this.props.status === LgpdConsentStatus.REVOKED) return;
    this.props.status = LgpdConsentStatus.REVOKED;
    this.props.withdrawnAt = new Date();
    this.touch();
  }

  withdraw() {
    if (this.props.status === LgpdConsentStatus.WITHDRAWN) return;
    this.props.status = LgpdConsentStatus.WITHDRAWN;
    this.props.withdrawnAt = new Date();
    this.touch();
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  static create(
    props: Optional<
      LgpdConsentProps,
      "status" | "withdrawnAt" | "createdAt" | "updatedAt"
    >,
    id?: UUIDVO,
  ) {
    if (!props.consentTerms) {
      throw new ConsentMustAcceptTermsError("");
    }

    return new LgpdConsentEntity(
      {
        ...props,
        status: props.status ?? LgpdConsentStatus.ACTIVE,
        withdrawnAt: props.withdrawnAt ?? null,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
      },
      id,
    );
  }
}
