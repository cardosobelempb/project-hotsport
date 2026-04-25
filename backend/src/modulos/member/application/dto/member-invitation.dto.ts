import { MemberInvitationStatus } from "../../domain/emuns/member-invitation-status.enum";
import { MemberRole } from "../../domain/emuns/member-roles.enum";

export interface MemberDto {
  organizationId: string;
  invitedBy: string | null;
  role: MemberRole;
  email: string;
  invitationStatus: MemberInvitationStatus;
  expiresAt: Date | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
