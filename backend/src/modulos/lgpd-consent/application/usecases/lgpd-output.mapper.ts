import { LgpdConsentStatus } from "../../domain/enums/lgpd-consent-status.enum";

export interface LgpdOutputDto {
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
  createdAt: Date;
  updatedAt: Date | null;
}

interface LgpdMapperInput {
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

export const mapLgpd = (record: LgpdMapperInput): LgpdOutputDto => ({
  id: record.userId, // Supondo que o ID seja o userId, ajuste conforme necessário
  userId: record.userId,
  organizationId: record.organizationId,
  consentTerms: record.consentTerms,
  consentMarketing: record.consentMarketing,
  consentDataSharing: record.consentDataSharing,
  consentAnalytics: record.consentAnalytics,
  ipAddress: record.ipAddress,
  macAddress: record.macAddress,
  userAgent: record.userAgent,
  consentVersion: record.consentVersion,
  status: LgpdConsentStatus.ACTIVE, // Definindo como ACTIVE por padrão, ajuste conforme necessário
  withdrawnAt: null, // Definindo como null por padrão, ajuste conforme necessário
  createdAt: new Date(), // Definindo a data atual, ajuste conforme necessário
  updatedAt: null, // Definindo como null por padrão, ajuste conforme necessário
});
