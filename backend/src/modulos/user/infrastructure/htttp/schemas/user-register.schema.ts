import {
  CpfString,
  IsoDateTimeOutput,
  PhoneString,
  UUIDString,
} from "@/shared/schemas/helpers";
import z from "zod";
import { UserBaseSchema } from "./user.schema";

export const UserRegisterBodySchema = UserBaseSchema.omit({});

// ✅ Response schema com tipos simples — sem union/transform
export const UserPresentSchema = z.object({
  id: UUIDString,
  firstName: z.string(),
  lastName: z.string(),
  phoneNumber: PhoneString,
  cpf: CpfString,
  status: z.string(),
  createdAt: IsoDateTimeOutput, // ✅ string pura para o Fastify serializar
});

export type UserRegisterBodyType = z.infer<typeof UserRegisterBodySchema>;
export type UserPresentType = z.infer<typeof UserPresentSchema>;
