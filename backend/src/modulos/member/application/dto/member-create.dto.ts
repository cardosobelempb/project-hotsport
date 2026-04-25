import { MemberRole } from "../../domain/emuns/member-roles.enum";

export interface MemberCreateDto {
  organizationId: string;
  userId: string;
  invitedBy: string | null;
  role: MemberRole;
}
