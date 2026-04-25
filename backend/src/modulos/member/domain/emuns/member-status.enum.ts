import z from "zod";

export enum MemberStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BLOCKED = "BLOCKED",
}

export const MemberStatusSchema = z.enum(MemberStatus);
