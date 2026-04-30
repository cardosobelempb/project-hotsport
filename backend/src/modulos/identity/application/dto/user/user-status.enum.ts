import z from "zod";

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BLOCKED = "BLOCKED",
}

export const UserStatusSchema = z.enum(UserStatus);
