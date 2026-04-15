import { MikrotikStatus } from "../../domain/emuns/mikrotik-status.enum";

export interface CreatMikrotikOutputDto {
  id: string;
  name: string;
  host: string;
  port: number;
  ipAddress: string;
  macAddress: string;
  username: string;
  status: MikrotikStatus;
  createdAt: string;
  organizationId: string;
}
