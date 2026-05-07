import z from "zod";

export enum LeadStatus {
  NEW = "NEW",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BANNED = "BANNED",
  CONTACTED = "CONTACTED",
  CONVERTED = "CONVERTED",
  DISCARDED = "DISCARDED",
}

export const LeadStatusSchema = z.enum(LeadStatus);
