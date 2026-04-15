import z from "zod";

export enum VoucherStatus {
  UNUSED = "UNUSED",
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
  REVOKED = "REVOKED",
}

export const VoucherStatusSchema = z.enum(VoucherStatus);
