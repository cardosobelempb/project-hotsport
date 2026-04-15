import { UserStatus } from "@/modulos/user/domain/enums/user-status.enum";

export interface CreateAccountOutputDto {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  cpf: string;
  email: string;
  status: UserStatus;
  createdAt: string;
}
