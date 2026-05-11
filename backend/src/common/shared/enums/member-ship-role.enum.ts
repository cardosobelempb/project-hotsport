import z from "zod";

export enum MembershipRole {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  AFFILIATE = "AFFILIATE",
  OPERATOR = "OPERATOR",
  CUSTOMER = "CUSTOMER",
  MANAGER = "MANAGER",
  SUPPORT = "SUPPORT",
  FINANCE = "FINANCE",
  MEMBER = "MEMBER",
}

export const MemberRoleSchema = z.enum(MembershipRole);
