import { IsoDateTimeOutput } from "@/shared/schemas/helpers";
import { z } from "zod";
import { UserEntity } from "../../domain/entities/user.entity";

export const UserBaseSchema = z.object({
  id: z.string(), // Validação customizada para UUIDVO
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

export const UserPresentSchema = UserBaseSchema.omit({
  // password: true,
  updatedAt: true,
});
export type UserResponseType = z.infer<typeof UserResponseSchema>;

export class UserMapper {
  static toHttp(user: UserEntity): UserResponseType {
    return UserPresentSchema.parse({
      id: user.id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      cpf: user.cpf,
      status: user.status,
      createdAt: user.createdAt.toISOString(),
    });
  }
}

export type UserType = z.infer<typeof UserBaseSchema>;
export type UserPresentType = z.infer<typeof UserPresentSchema>;
