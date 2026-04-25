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
