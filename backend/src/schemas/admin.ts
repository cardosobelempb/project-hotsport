import { z } from "zod";

import { EmailString, IsoDateTimeString, UUIDString } from "./helpers.js";

export const AdminSchema = z.object({
  id: UUIDString,
  email: EmailString,
  createdAt: IsoDateTimeString,
});
