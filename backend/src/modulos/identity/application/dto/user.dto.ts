import { DeepPartial } from "@/common/domain/types/DeepPartial";

export interface UserDto {
  id?: string | undefined;
  firstName: string;
  lastName: string;
  slug: string;
  logoUrl: string | null;
  email: string;
  cpf: string;
  phoneNumber?: string | null | undefined;
  status?: string | undefined;
  createdAt?: string | undefined;
  updatedAt?: string | null | undefined;
  deletedAt?: string | null | undefined;
}

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  cpf: string;
  email: string;
}

export interface UpdateUserDto extends DeepPartial<UserDto> {}

export interface UserPresenterDto {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  cpf: string;
  email: string;
  status: string;
  createdAt: string;
}

export const createUserRawExample: UserDto = {
  firstName: "John",
  lastName: "Doe",
  slug: "john-doe",
  logoUrl: null,
  email: "jondoe@email.com",
  cpf: "000.000.000-00",
  phoneNumber: "+5511999999999",
};

export const userPresenterRawExample: UserPresenterDto = {
  id: "00000000-0000-4000-8000-000000000000",
  firstName: "John",
  lastName: "Doe",
  phoneNumber: "+5511999999999",
  cpf: "000.000.000-00",
  email: "join@emial.com",
  status: "active",
  createdAt: new Date().toISOString(),
};
