import { DeepPartial } from "@/common/domain/types/DeepPartial";
import { MemberRole } from "@/shared/enums/member-role.enum";
import { MemberStatus } from "@/shared/enums/member-status.enum";

export interface CreateMemberDto {
  id: string;
  organizationId: string;
  userId: string;
  invitedBy: string | null;
  role: MemberRole;
  status: MemberStatus;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface UpdateMemberDto extends DeepPartial<CreateMemberDto> {}

export interface MemberPresenterDto {
  id: string;
  organizationId: string;
  userId: string;
  invitedBy: string | null;
  role: MemberRole;
  status: MemberStatus;
  joinedAt: string;
  createdAt: string;
}

export const createMemberRawExample: CreateMemberDto = {
  id: "00000000-0000-4000-8000-000000000000",
  organizationId: "00000000-0000-4000-8000-000000000000",
  userId: "00000000-0000-4000-8000-000000000000",
  invitedBy: null,
  role: MemberRole.MEMBER,
  status: MemberStatus.ACTIVE,
  joinedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  deletedAt: null,
};

export const memberPresenterRawExample: MemberPresenterDto = {
  id: "00000000-0000-4000-8000-000000000000",
  organizationId: "00000000-0000-4000-8000-000000000000",
  userId: "00000000-0000-4000-8000-000000000000",
  invitedBy: null,
  role: MemberRole.MEMBER,
  status: MemberStatus.ACTIVE,
  joinedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
};
