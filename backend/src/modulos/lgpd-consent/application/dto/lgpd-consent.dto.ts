import { LgpdConsentStatus } from "../../domain/enums/lgpd-consent-status.enum";

export interface LgpdConsentDto {
  id: string;
  userId: string;
  organizationId: string;
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
  withdrawnAt: Date | null;
  updatedAt: string | null;
}

export interface OrganizationInputDto extends Omit<
  LgpdConsentDto,
  "id" | "createdAt" | "updatedAt" | "status" | "withdrawnAt"
> {
  userId: string;
  organizationId: string;
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
}

export interface OrganizationOutputDto extends Omit<
  LgpdConsentDto,
  "updatedAt" | "withdrawnAt"
> {
  id: string;
  userId: string;
  organizationId: string;
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
  withdrawnAt: Date | null;
  updatedAt: string | null;
}

export interface OrganizationOptionalDto extends Partial<LgpdConsentDto> {}
