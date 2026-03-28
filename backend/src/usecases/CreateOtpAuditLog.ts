import { prisma } from "../lib/db.js";

// ── Audit event types ─────────────────────────────────────────────────────────

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

// ── DTOs ──────────────────────────────────────────────────────────────────────

interface InputDto {
  event: OtpAuditEvent;
  cpf: string;
  phone?: string;
  ip?: string;
  detail?: string;
}

// ── Use Case ──────────────────────────────────────────────────────────────────

/**
 * Persists a single OTP audit log entry for compliance and LGPD purposes.
 *
 * No try/catch — errors propagate to the caller (route layer), which is
 * expected to suppress them with `.catch()` so audit failures never block
 * the main OTP flow.
 */
export class CreateOtpAuditLog {
  async execute(dto: InputDto): Promise<void> {
    await prisma.otpAuditLog.create({
      data: {
        event: dto.event,
        cpf: dto.cpf,
        phoneNumber: dto.phone ?? null,
        ipAddress: dto.ip ?? null,
        detail: dto.detail ?? null,
      },
    });
  }
}
