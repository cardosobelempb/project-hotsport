// import { LgpdConsentStatus } from "../../domain/enums/lgpd-consent-status.enum";

import { LgpdConsentStatus } from "../../domain/enums/lgpd-consent-status.enum";

// export interface LgpdConsentDto {
//   id: string;
//   lgpdconsentId: string;
//   organizationId: string;
//   // O que o usuário aceitou
//   consentTerms: boolean;
//   consentMarketing: boolean;
//   consentDataSharing: boolean;
//   consentAnalytics: boolean;
//   // Rastreabilidade (obrigatório pela LGPD)
//   ipAddress: string;
//   macAddress: string;
//   lgpdconsentAgent: string;
//   consentVersion: string;
//   // Ciclo de vida
//   status: LgpdConsentStatus;
//   withdrawnAt: Date | null;
//   updatedAt: string | null;
// }

// export interface OrganizationInputDto extends Omit<
//   LgpdConsentDto,
//   "id" | "createdAt" | "updatedAt" | "status" | "withdrawnAt"
// > {
//   lgpdconsentId: string;
//   organizationId: string;
//   // O que o usuário aceitou
//   consentTerms: boolean;
//   consentMarketing: boolean;
//   consentDataSharing: boolean;
//   consentAnalytics: boolean;
//   // Rastreabilidade (obrigatório pela LGPD)
//   ipAddress: string;
//   macAddress: string;
//   lgpdconsentAgent: string;
//   consentVersion: string;
// }

// export interface OrganizationOutputDto extends Omit<
//   LgpdConsentDto,
//   "updatedAt" | "withdrawnAt"
// > {
//   id: string;
//   lgpdconsentId: string;
//   organizationId: string;
//   // O que o usuário aceitou
//   consentTerms: boolean;
//   consentMarketing: boolean;
//   consentDataSharing: boolean;
//   consentAnalytics: boolean;
//   // Rastreabilidade (obrigatório pela LGPD)
//   ipAddress: string;
//   macAddress: string;
//   lgpdconsentAgent: string;
//   consentVersion: string;
//   // Ciclo de vida
//   status: LgpdConsentStatus;
//   withdrawnAt: Date | null;
//   updatedAt: string | null;
// }

// export interface OrganizationOptionalDto extends Partial<LgpdConsentDto> {}

interface LgpdConsentDto {
  id: string;
  lgpdconsentId: string;
  organizationId: string;
  // O que o usuário aceitou
  consentTerms: boolean;
  consentMarketing: boolean;
  consentDataSharing: boolean;
  consentAnalytics: boolean;
  // Rastreabilidade (obrigatório pela LGPD)
  ipAddress: string;
  macAddress: string;
  lgpdconsentAgent: string;
  consentVersion: string;
  // Ciclo de vida
  status: LgpdConsentStatus;
  withdrawnAt: Date | null;
  updatedAt: string | null;
}

export interface LgpdConsentRawDto extends Omit<
  LgpdConsentDto,
  "createdAt" | "updatedAt" | "status" | "withdrawnAt"
> {
  id: string;
  lgpdconsentId: string;
  organizationId: string;
  // O que o usuário aceitou
  consentTerms: boolean;
  consentMarketing: boolean;
  consentDataSharing: boolean;
  consentAnalytics: boolean;
  // Rastreabilidade (obrigatório pela LGPD)
  ipAddress: string;
  macAddress: string;
  lgpdconsentAgent: string;
  consentVersion: string;
}

export interface LgpdConsentInputDto extends Omit<
  LgpdConsentDto,
  "id" | "createdAt" | "updatedAt" | "status" | "withdrawnAt"
> {
  lgpdconsentId: string;
  organizationId: string;
  // O que o usuário aceitou
  consentTerms: boolean;
  consentMarketing: boolean;
  consentDataSharing: boolean;
  consentAnalytics: boolean;
  // Rastreabilidade (obrigatório pela LGPD)
  ipAddress: string;
  macAddress: string;
  lgpdconsentAgent: string;
  consentVersion: string;
}

export interface LgpdConsentOutputDto extends Omit<
  LgpdConsentDto,
  "updatedAt" | "withdrawnAt"
> {
  id: string;
  lgpdconsentId: string;
  organizationId: string;
  // O que o usuário aceitou
  consentTerms: boolean;
  consentMarketing: boolean;
  consentDataSharing: boolean;
  consentAnalytics: boolean;
  // Rastreabilidade (obrigatório pela LGPD)
  ipAddress: string;
  macAddress: string;
  lgpdconsentAgent: string;
  consentVersion: string;
  // Ciclo de vida
  status: LgpdConsentStatus;
  withdrawnAt: Date | null;
}

export interface LgpdConsentOptionalDto extends Partial<LgpdConsentDto> {}
