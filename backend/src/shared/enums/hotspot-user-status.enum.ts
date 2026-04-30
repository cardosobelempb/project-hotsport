import z from "zod";

export enum HotspotUserStatus {
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
  BLOCKED = "BLOCKED",
  PENDING = "PENDING",
  SUSPENDED = "SUSPENDED",
}

export const HotspotUserStatusSchema = z.enum(HotspotUserStatus);
