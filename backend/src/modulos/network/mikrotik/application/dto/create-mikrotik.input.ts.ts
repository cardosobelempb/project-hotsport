export interface CreateMikrotikInputDto {
  name: string;
  username: string;
  host: string;
  port: number;
  ipAddress: string;
  macAddress: string;
  passwordHash: string;
  organizationId: string;
}
