import { MemberRole } from "../../domain/emuns/member-roles.enum";
import { MemberStatus } from "../../domain/emuns/member-status.enum";

export interface MemberPresentDto {
  id: string;
  organizationId: string;
  userId: string;
  invitedBy: string | null;
  role: MemberRole;
  status: MemberStatus;
  joinedAt: string;
  createdAt: string;
}

export interface MemberCreatePresentDto {
  id: string;
  organizationId: string;
  userId: string;
  role: MemberRole;
  status: MemberStatus;
  joinedAt: string;
  createdAt: string;
}

export interface MemberUpdatePresentDto {
  organizationId: string;
  userId: string;
  memberId: string;
  role: MemberRole;
}
