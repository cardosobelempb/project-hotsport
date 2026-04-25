export interface MemberCreateDto {
  organizationId: string;
  userId: string;
  invitedBy: string | null;
}
