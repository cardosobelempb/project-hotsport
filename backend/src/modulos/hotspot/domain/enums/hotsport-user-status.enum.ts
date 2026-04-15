import z from "zod";

export enum HotspotUserStatus {
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
  SUSPENDED = "SUSPENDED",
  BLOCKED = "BLOCKED",
  PENDING = "PENDING",
}

export const HotspotUserStatusSchema = z.enum(HotspotUserStatus);
