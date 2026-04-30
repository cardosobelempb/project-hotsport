import { prisma } from "@/shared/lib/db";

export type OtpAuditEvent =
  | "otp_requested"
  | "otp_sent"
  | "otp_whatsapp_error"
  | "otp_throttled"
  | "otp_validation_error"
  | "otp_request_error"
  | "otp_verify_attempt"
  | "otp_verified"
  | "otp_invalid"
  | "otp_max_attempts"
  | "otp_not_found"
  | "otp_user_not_found";

interface InputDto {
  event: OtpAuditEvent;
  cpf: string;
  phone?: string;
  ip?: string;
  detail?: string;
}

// TODO: Requires `otpAuditLog` model in schema.prisma before this can run.
export class CreateOtpAuditLog {
  async execute(_dto: InputDto): Promise<void> {
    // Placeholder until otpAuditLog model is added to schema.prisma
    void prisma;
  }
}
