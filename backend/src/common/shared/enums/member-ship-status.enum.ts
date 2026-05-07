import z from "zod";

export enum MemberShipStatus {
  ACTIVE = "ACTIVE",
  INVITED = "INVITED",
  SUSPENDED = "SUSPENDED",
  REMOVED = "REMOVED",
  DELETED = "DELETED",
}

export const MemberStatusSchema = z.enum(MemberShipStatus);
