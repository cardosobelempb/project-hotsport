import { IsoDateTimeOutput, UUIDString } from "@/shared/schemas/helpers";
import { z } from "zod";

export const UserBaseSchema = z.object({
  id: UUIDString, // Validação customizada para UUIDVO
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  cpf: z.string().min(1, "CPF is required"),
  status: z.string().min(1, "Status is required"),
  createdAt: IsoDateTimeOutput,
  updatedAt: IsoDateTimeOutput,
});

// Resposta pública (sem senha)
export const UserResponseSchema = UserBaseSchema.omit({
  // password: true,
  updatedAt: true,
});

export type UserResponseType = z.infer<typeof UserResponseSchema>;
export type UserType = z.infer<typeof UserBaseSchema>;
