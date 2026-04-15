import z from "zod";

export enum HotspotPlanType {
  TIME = "TIME",
  DATA = "DATA",
  UNLIMITED = "UNLIMITED",
}

export const HotspotPlanTypeSchema = z.enum(HotspotPlanType);
