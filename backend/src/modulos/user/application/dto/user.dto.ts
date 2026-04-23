import { UserStatus } from "../../domain/enums/user-status.enum";

interface UserDto {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  cpf: string;
  email: string;
  status: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface UserRawDto extends Omit<
  UserDto,
  "createdAt" | "updatedAt" | "status"
> {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  cpf: string;
  email: string;
}

export interface UserInputDto extends Omit<
  UserDto,
  "id" | "createdAt" | "updatedAt" | "status"
> {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  cpf: string;
  email: string;
}

export interface UserOutputDto extends Omit<UserDto, "updatedAt"> {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  cpf: string;
  email: string;
  status: UserStatus;
  createdAt: string;
}

export interface UserOptionalDto extends Partial<UserDto> {}
