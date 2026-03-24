export interface AdminDomainEntity {
  id: number;
  email: string;
  passwordHash: string;
}

export interface IAdminRepository {
  findByEmail(email: string): Promise<AdminDomainEntity | null>;
}
