import z from "zod";

export enum MemberRole {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
  OPERATOR = "OPERATOR",
  HOTSPOT_USER = "HOTSPOT_USER",
}

export const MemberRoleSchema = z.enum(MemberRole);
