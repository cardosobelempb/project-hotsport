// import { HotspotUserStatus } from "../../domain/enums/hotsport-user-status.enum";

// export interface HotsportUserDto {
//   id: string;
//   hotsportuserId: string;
//   mikrotikId: string;
//   username: string;
//   passwordHash: string;
//   macAddress: string;
//   ipAddress: string;
//   status: HotspotUserStatus;
//   createAt: string;
//   updatedAt: string | null;
// }

// export interface HotsportUserInputDto extends Omit<
//   HotsportUserDto,
//   "id" | "createdAt" | "updatedAt" | "status"
// > {
//   hotsportuserId: string;
//   mikrotikId: string;
//   username: string;
//   passwordHash: string;
//   macAddress: string;
//   ipAddress: string;
// }

// export interface HotsportUserOutputDto extends Omit<
//   HotsportUserDto,
//   "updatedAt"
// > {
//   id: string;
//   hotsportuserId: string;
//   mikrotikId: string;
//   username: string;
//   passwordHash: string;
//   macAddress: string;
//   ipAddress: string;
//   status: HotspotUserStatus;
//   createAt: string;
// }

// export interface HotsportUserOptionalDto extends Partial<HotsportUserDto> {}

import { HotspotUserStatus } from "../../domain/enums/hotsport-user-status.enum";

interface HotsportUserDto {
  id: string;
  hotsportuserId: string;
  mikrotikId: string;
  username: string;
  passwordHash: string;
  macAddress: string;
  ipAddress: string;
  status: HotspotUserStatus;
  createdAt: string;
  updatedAt: string | null;
}

export interface HotsportUserRawDto extends Omit<
  HotsportUserDto,
  "createdAt" | "updatedAt" | "status"
> {
  id: string;
  hotsportuserId: string;
  mikrotikId: string;
  username: string;
  passwordHash: string;
  macAddress: string;
  ipAddress: string;
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
  createdAt: string;
}

export interface HotsportUserOptionalDto extends Partial<HotsportUserDto> {}
