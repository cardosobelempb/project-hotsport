export interface CreateAccountInputDto {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  passwordConfirmation: string;
  phoneNumber: string;
  cpf: string;
}
