import z from "zod";

export enum MikrotikStatus {
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
  ERROR = "ERROR",
}

export const MikrotikStatusSchema = z.enum(MikrotikStatus);
