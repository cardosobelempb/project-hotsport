import { MemberRole } from "../../domain/emuns/member-roles.enum";

export interface MemberUpdateDto {
  memberId: string;
  organizationId?: string | undefined;
  userId?: string | undefined;
  role?: MemberRole | undefined;
}
