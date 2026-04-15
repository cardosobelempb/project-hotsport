import { LgpdConsentStatus } from "@/modulos/lgpd-consent/domain/enums/lgpd-consent-status.enum";
import { ErrorSchema, ValidationErrorSchema } from "@/shared/schemas/error";
import { IsoDateTimeOutput, UUIDString } from "@/shared/schemas/helpers";
import { z } from "zod";

export const LgpdConsentStatusSchema = z.enum(LgpdConsentStatus);

export const LgpdConsentBaseSchema = z.object({
  id: UUIDString,
  userId: UUIDString,
  organizationId: UUIDString,
  macAddress: z.string(),
  ipAddress: z.string(),
  // O que o usuário aceitou
  consentTerms: z.boolean(),
  consentMarketing: z.boolean(),
  consentDataSharing: z.boolean(),
  consentAnalytics: z.boolean(),
  // Rastreabilidade (obrigatório pela LGPD)
  userAgent: z.string(),
  consentVersion: z.string(),
  status: LgpdConsentStatusSchema,
  createdAt: IsoDateTimeOutput,
  updatedAt: IsoDateTimeOutput,
  withdrawnAt: IsoDateTimeOutput,
});

export const LgpdConsentResponseSchema = z.object({
  id: UUIDString,
  userId: UUIDString,
  organizationId: UUIDString,
  macAddress: z.string(),
  ipAddress: z.string(),
  // O que o usuário aceitou
  consentTerms: z.boolean(),
  consentMarketing: z.boolean(),
  consentDataSharing: z.boolean(),
  consentAnalytics: z.boolean(),
  // Rastreabilidade (obrigatório pela LGPD)
  userAgent: z.string(),
  consentVersion: z.string(),
  status: LgpdConsentStatusSchema,
  createdAt: IsoDateTimeOutput,
  // updatedAt: IsoDateTimeOutput,
  withdrawnAt: IsoDateTimeOutput,
});

export const CreateLgpdConsentBodySchema = z
  .object({})
  .extend(LgpdConsentBaseSchema);

export const CreateLgpdConsentResponseSchema = {
  201: LgpdConsentResponseSchema,
  409: ErrorSchema,
  422: ValidationErrorSchema,
  500: ErrorSchema,
};

// export const CreateLgpdConsentResponseSchema = z
//   .object({
//     id: UUIDString,
//     status: LgpdConsentStatusSchema,
//     createdAt: IsoDateTimeOutput,
//     updatedAt: IsoDateTimeOutput,
//     withdrawnAt: IsoDateTimeOutput,
//   })
//   .extend(LgpdConsentBaseSchema);
