import { LgpdConsentStatus } from "../../domain/enums/lgpd-consent-status.enum";

export interface CreateLgpdOutputDto {
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
  createdAt: Date;
  updatedAt: Date | null;
  withdrawnAt: Date | null;
}
