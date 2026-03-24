export interface AdminEntity {
  id: number;
  email: string;
  password: string;
  createdAt: Date;
}

export interface IAdminRepository {
  findByEmail(email: string): Promise<AdminEntity | null>;
}
