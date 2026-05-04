import z from "zod";

export enum AccountType {
  PASSWORD = "PASSWORD",
  OAUTH = "OAUTH",
  OTP = "OTP",
}

export const AccountTypeSchema = z.enum(AccountType);
