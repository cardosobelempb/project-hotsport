import { UserStatus } from "@/generated/prisma";
import { PhoneStringType } from "@/shared/schemas/helpers";

export interface UserProps {
  firstName: string;
  lastName: string;
  status: UserStatus; // ✅ enum UserStatus
  phoneNumber: PhoneStringType;
  cpf: string;
  createdAt: Date;
  updatedAt: Date;
}
