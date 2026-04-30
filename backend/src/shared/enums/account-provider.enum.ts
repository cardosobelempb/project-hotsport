import z from "zod";

export enum AccountProvider {
  EMAIL = "EMAIL",
  GOOGLE = "GOOGLE",
  FACEBOOK = "FACEBOOK",
  APPLE = "APPLE",
}

export const AccountProviderSchema = z.enum(AccountProvider);
