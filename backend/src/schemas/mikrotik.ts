import { z } from "zod";

import { IsoDateTimeString, UUIDString } from "./helpers.js";

export const MikrotikRouterSchema = z.object({
  id: UUIDString,
  name: z.string(),
  ipAddress: z.string(),
  username: z.string(),
  password: z.string(),
  port: z.number().int(),
  status: z.string(),
  activeUsers: z.number().int(),
  hotspotUrl: z.string().nullable(),
  createdAt: IsoDateTimeString,
  updatedAt: IsoDateTimeString,
});

export const CreateMikrotikRouterSchema = MikrotikRouterSchema.omit({
  id: true,
  status: true,
  activeUsers: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateMikrotikRouterSchema = CreateMikrotikRouterSchema.partial();

export const MikrotikRouterListSchema = z.array(MikrotikRouterSchema);
