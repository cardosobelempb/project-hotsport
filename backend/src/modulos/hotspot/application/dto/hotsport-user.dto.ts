import { HotspotUserStatus } from "../../domain/enums/hotsport-user-status.enum";

export interface HotsportUserDto {
  id: string;
  hotsportuserId: string;
  mikrotikId: string;
  username: string;
  passwordHash: string;
  macAddress: string;
  ipAddress: string;
  status: HotspotUserStatus;
  createAt: string;
  updatedAt: string | null;
}

export interface HotsportUserInputDto extends Omit<
  HotsportUserDto,
  "id" | "createdAt" | "updatedAt" | "status"
> {
  hotsportuserId: string;
  mikrotikId: string;
  username: string;
  passwordHash: string;
  macAddress: string;
  ipAddress: string;
}

export interface HotsportUserOutputDto extends Omit<
  HotsportUserDto,
  "updatedAt"
> {
  id: string;
  hotsportuserId: string;
  mikrotikId: string;
  username: string;
  passwordHash: string;
  macAddress: string;
  ipAddress: string;
  status: HotspotUserStatus;
  createAt: string;
}

export interface HotsportUserOptionalDto extends Partial<HotsportUserDto> {}
