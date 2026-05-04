import { DeepPartial } from "@/common/domain/types/DeepPartial";
import { MemberRole } from "@/shared/enums/member-role.enum";
import { MemberStatus } from "@/shared/enums/member-status.enum";

export interface MemberDto {
  id: string;
  organizationId: string;
  userId: string;
  invitedBy: string | null;
  role: string;
  status: string;
  joinedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
}

export interface CreateMemberDto {
  userId: string;
  invitedBy: string | null;
  role: string;
  joinedAt: string | null;
  organizationId: string;
}

export interface UpdateMemberDto extends DeepPartial<MemberDto> {}

export interface MemberPresenterDto {
  id: string;
  status: string;
  createdAt: string | null;
  organizationId: string;
  userId: string;
  invitedBy: string | null;
  role: string;
  joinedAt: string | null;
}

export interface MemberSummaryDto {
  id: string;
  status: string;
  createdAt: string | null;
  organizationId: string;
  userId: string;
  role: string;
  joinedAt: string | null;
}

export const createMemberRawExample: MemberDto = {
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
