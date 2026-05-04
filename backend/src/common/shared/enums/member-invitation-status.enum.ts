import z from "zod";

export enum MemberInvitationStatus {
  ACTIVE = "ACTIVE",
  ACCEPTED = "ACCEPTED",
  DECLINED = "DECLINED",
  EXPIRED = "EXPIRED",
  INVITED = "INVITED",
  PENDING = "PENDING",
  REMOVED = "REMOVED",
}

export const MemberInvitationStatusSchema = z.enum(MemberInvitationStatus);
