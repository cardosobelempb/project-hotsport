export interface CreateUserInputDto {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  passwordConfirmation: string;
  phoneNumber: string;
  cpf: string;
}
