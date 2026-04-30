export interface CreateLgpdConsentInputDto {
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
