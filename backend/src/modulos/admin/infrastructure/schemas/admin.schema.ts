import { z } from "zod";

import { EmailString, IsoDateTimeString, UUIDString } from "@/shared/schemas";

export const AdminSchema = z.object({
  id: UUIDString,
  email: EmailString,
  createdAt: IsoDateTimeString,
});
