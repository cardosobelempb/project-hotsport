import { MikrotikStatus } from "../../domain/emuns/mikrotik-status.enum";

interface MikrotikDto {
  id: string;
  organizationId: string;
  name: string;
  host: string;
  port: number;
  username: string;
  passwordHash: string;
  status: MikrotikStatus;
  ipAddress: string;
  macAddress: string;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
}

export interface MikrotikRawDto extends Omit<
  MikrotikDto,
  "createdAt" | "updatedAt" | "deletedAt" | "status"
> {
  id: string;
  organizationId: string;
  name: string;
  host: string;
  port: number;
  username: string;
  passwordHash: string;
  ipAddress: string;
  macAddress: string;
}

export interface MikrotikInputDto extends Omit<
  MikrotikDto,
  "id" | "createdAt" | "updatedAt" | "status" | "deletedAt"
> {
  organizationId: string;
  name: string;
  host: string;
  port: number;
  username: string;
  passwordHash: string;
  ipAddress: string;
  macAddress: string;
}

export interface MikrotikOutputDto extends Omit<
  MikrotikDto,
  "updatedAt" | "deletedAt"
> {
  id: string;
  organizationId: string;
  name: string;
  host: string;
  port: number;
  username: string;
  passwordHash: string;
  status: MikrotikStatus;
  ipAddress: string;
  macAddress: string;
  createdAt: string;
}

export interface MikrotikOptionalDto extends Partial<MikrotikDto> {}
