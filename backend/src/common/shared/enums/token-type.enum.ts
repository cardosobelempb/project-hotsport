import z from "zod";

export enum TokenType {
  REFRESH = "REFRESH",
  ACCESS = "ACCESS",
  RESET_PASSWORD = "RESET_PASSWORD",
  API_KEY = "API_KEY",
  EMAIL_VERIFICATION = "EMAIL_VERIFICATION",
}

export const TokenTypeSchema = z.enum(TokenType);
