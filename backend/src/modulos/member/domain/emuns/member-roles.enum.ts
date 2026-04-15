import z from "zod";

export enum MemberRole {
  OWNER,
  ADMIN,
  OPERATOR,
}

export const MemberRoleSchema = z.enum(MemberRole);
