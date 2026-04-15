import { UUIDVO } from "@/core/domain/values-objects/uuidvo/uuid.vo";

import { Optional } from "@/core/domain/common/types";
import { BaseEntity } from "@/core/domain/domain/entities/base.entity";
import { LgpdConsentStatus } from "../enums/lgpd-consent-status.enum";

export interface LgpdConsentProps {
  userId: UUIDVO;
  organizationId: UUIDVO;
  // O que o usuário aceitou
  consentTerms: boolean;
  consentMarketing: boolean;
  consentDataSharing: boolean;
  consentAnalytics: boolean;
  // Rastreabilidade (obrigatório pela LGPD)
  ipAddress: string;
  macAddress: string;
  userAgent: string;
  consentVersion: string;
  // Ciclo de vida
  status: LgpdConsentStatus;
  createdAt: Date;
  updatedAt: Date | null;
  withdrawnAt: Date | null;
}

export class LgpdConsentEntity extends BaseEntity<LgpdConsentProps> {
  get userId(): UUIDVO {
    return this.props.userId;
  }

  get organizationId(): UUIDVO {
    return this.props.organizationId;
  }

  get consentTerms(): boolean {
    return this.props.consentTerms;
  }

  get consentMarketing(): boolean {
    return this.props.consentMarketing;
  }

  get consentDataSharing(): boolean {
    return this.props.consentDataSharing;
  }

  get consentAnalytics(): boolean {
    return this.props.consentAnalytics;
  }

  get ipAddress(): string {
    return this.props.ipAddress;
  }

  get macAddress(): string {
    return this.props.macAddress;
  }

  get userAgent(): string {
    return this.props.userAgent;
  }

  get consentVersion(): string {
    return this.props.consentVersion;
  }

  get status(): LgpdConsentStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date | null {
    return this.props.updatedAt;
  }

  get withdrawnAt(): Date | null {
    return this.props.withdrawnAt;
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }

  withdraw(): void {
    if (this.props.status === LgpdConsentStatus.WITHDRAWN) return;

    this.props.status = LgpdConsentStatus.WITHDRAWN;
    this.props.withdrawnAt = new Date();
    this.touch();
  }

  static create(
    props: Optional<
      LgpdConsentProps,
      "status" | "createdAt" | "updatedAt" | "withdrawnAt"
    >,
    id?: UUIDVO,
  ): LgpdConsentEntity {
    return new LgpdConsentEntity(
      {
        ...props,
        status: props.status ?? LgpdConsentStatus.ACTIVE,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: null,
        withdrawnAt: null,
      },
      id,
    );
  }
}
