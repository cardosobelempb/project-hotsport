import {
  EmailString,
  IsoDateTimeOutput,
  UUIDString,
} from "@/shared/schemas/helpers";
import { z } from "zod";

export const AdminSchema = z.object({
  id: UUIDString,
  email: EmailString,
  createdAt: IsoDateTimeOutput,
});
