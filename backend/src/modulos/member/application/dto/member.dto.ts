import { MemberRole } from "../../domain/emuns/member-roles.enum";

interface MemberDto {
  id: string;
  organizationId: string;
  userId: string;
  role: MemberRole;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface MemberRawDto extends Omit<
  MemberDto,
  "createdAt" | "updatedAt" | "role" | "deletedAt"
> {
  id: string;
  organizationId: string;
  userId: string;
}

export interface MemberInputDto extends Omit<
  MemberDto,
  "id" | "createdAt" | "updatedAt" | "role" | "deletedAt"
> {
  organizationId: string;
  userId: string;
}

export interface MemberOutputDto extends Omit<
  MemberDto,
  "updatedAt" | "deletedAt"
> {
  id: string;
  organizationId: string;
  userId: string;
  role: MemberRole;
  createdAt: string;
}

export interface MemberOptionalDto extends Partial<MemberDto> {}
