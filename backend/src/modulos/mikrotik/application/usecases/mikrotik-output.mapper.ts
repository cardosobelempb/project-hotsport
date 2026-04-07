export interface MikrotikOutputDto {
  id: number;
  name: string;
  ip: string;
  username: string;
  password: string;
  port: number;
  status: string;
  activeUsers: number;
  createdAt: string;
  hotspotAddress: string | null;
}

interface MikrotikMapperInput {
  id: number;
  name: string;
  ip: string;
  username: string;
  password: string;
  port: number;
  status: string;
  activeUsers: number;
  createdAt: Date;
  hotspotAddress: string | null;
}

export const mapMikrotik = (
  mikrotik: MikrotikMapperInput,
): MikrotikOutputDto => ({
  id: mikrotik.id,
  name: mikrotik.name,
  ip: mikrotik.ip,
  username: mikrotik.username,
  password: mikrotik.password,
  port: mikrotik.port,
  status: mikrotik.status,
  activeUsers: mikrotik.activeUsers,
  createdAt: mikrotik.createdAt.toISOString(),
  hotspotAddress: mikrotik.hotspotAddress,
});
