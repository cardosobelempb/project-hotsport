import z from "zod";

export enum ProviderType {
  GOOGLE = "GOOGLE",
  FACEBOOK = "FACEBOOK",
  APPLE = "APPLE",
  CREDENTIALS = "CREDENTIALS",
  OTHER = "OTHER",
}

export const ProviderTypeSchema = z.enum(ProviderType);
