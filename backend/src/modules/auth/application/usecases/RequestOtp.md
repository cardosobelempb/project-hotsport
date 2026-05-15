import axios from "axios";
import bcrypt from "bcryptjs";
import { randomInt } from "crypto";
import dayjs from "dayjs";

import { StandardError } from "@/core";
import { prisma } from "@/shared/lib/db";

const OTP_MIN_INTERVAL_SECONDS = 60;
const OTP_MAX_PER_HOUR = 5;
const MSG_COOLDOWN = "Please wait 60 seconds before requesting a new code.";
const MSG_HOURLY_LIMIT = "Request limit reached. Try again in one hour.";

class RateLimitError extends StandardError {
  constructor(message: string) {
    super({ statusCode: 429, error: "RATE_LIMIT_EXCEEDED", message });
  }
}

interface RequestOtpInputDto {
  cpf: string;
  phone: string;
  name?: string;
}

interface RequestOtpOutputDto {
  status: "sent" | "error";
  detail?: string;
}

// TODO: Update Prisma queries once schema aligns (userOtp → otp, hash → codeHash, used → usedAt).
export class RequestOtp {
  async execute(dto: RequestOtpInputDto): Promise<RequestOtpOutputDto> {
    const now = dayjs();
    const oneHourAgo = now.subtract(1, "hour").toDate();
    const cooldownThreshold = now
      .subtract(OTP_MIN_INTERVAL_SECONDS, "second")
      .toDate();

    await this.checkRateLimitByCpf(dto.cpf, oneHourAgo, cooldownThreshold);
    await this.checkRateLimitByPhone(dto.phone, oneHourAgo, cooldownThreshold);

    const user = await prisma.user.upsert({
      where: { cpf: dto.cpf },
      update: {
        phoneNumber: dto.phone,
        ...(dto.name !== undefined ? { firstName: dto.name } : {}),
      },
      create: {
        cpf: dto.cpf,
        phoneNumber: dto.phone,
        firstName: dto.name ?? "",
        lastName: "",
        email: `${dto.cpf}@placeholder.local`,
      },
    });

    const otp = String(randomInt(100_000, 1_000_000));
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = dayjs().add(5, "minute").toDate();

    const whatsappUrl =
      process.env["WHATSAPP_SERVER_URL"] ?? "http://127.0.0.1:3030";
    const whatsappToken = process.env["WHATSAPP_SERVER_TOKEN"] ?? "";

    const message = `Your access code is: *${otp}*\nIt expires in 5 minutes. Do not share it with anyone.`;

    await axios
      .post(
        `${whatsappUrl}/send`,
        { phone: dto.phone, message },
        {
          headers: { "x-whatsapp-token": whatsappToken },
          timeout: 10_000,
        },
      )
      .catch(() => {
        throw new Error("WhatsApp delivery failed");
      });

    await prisma.otp.create({
      data: {
        userId: user.id,
        phone: dto.phone,
        codeHash: otpHash,
        expiresAt,
      },
    });

    return { status: "sent" };
  }

  private async checkRateLimitByCpf(
    cpf: string,
    oneHourAgo: Date,
    cooldownThreshold: Date,
  ): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { cpf },
      select: { id: true },
    });

    if (!user) return;

    const lastOtp = await prisma.otp.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });

    if (lastOtp && lastOtp.createdAt > cooldownThreshold) {
      throw new RateLimitError(MSG_COOLDOWN);
    }

    const cpfRequestsLastHour = await prisma.otp.count({
      where: { userId: user.id, createdAt: { gte: oneHourAgo } },
    });

    if (cpfRequestsLastHour >= OTP_MAX_PER_HOUR) {
      throw new RateLimitError(MSG_HOURLY_LIMIT);
    }
  }

  private async checkRateLimitByPhone(
    phone: string,
    oneHourAgo: Date,
    cooldownThreshold: Date,
  ): Promise<void> {
    const lastOtpByPhone = await prisma.otp.findFirst({
      where: { phone },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });

    if (lastOtpByPhone && lastOtpByPhone.createdAt > cooldownThreshold) {
      throw new RateLimitError(MSG_COOLDOWN);
    }

    const phoneRequestsLastHour = await prisma.otp.count({
      where: { phone, createdAt: { gte: oneHourAgo } },
    });

    if (phoneRequestsLastHour >= OTP_MAX_PER_HOUR) {
      throw new RateLimitError(MSG_HOURLY_LIMIT);
    }
  }
}
