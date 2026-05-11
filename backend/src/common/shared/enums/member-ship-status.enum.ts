import z from "zod";

export enum MembershipStatus {
  ACTIVE = "ACTIVE",
  INVITED = "INVITED",
  SUSPENDED = "SUSPENDED",
  REMOVED = "REMOVED",
  DELETED = "DELETED",
}

export const MemberStatusSchema = z.enum(MembershipStatus);
