import axios from "axios";
import bcrypt from "bcryptjs";
import { randomInt } from "crypto";
import dayjs from "dayjs";

import { RateLimitError } from "../../errors/index.js";
import { prisma } from "../../lib/db.js";

const OTP_MIN_INTERVAL_SECONDS = 60;
const OTP_MAX_PER_HOUR = 5;
const MSG_COOLDOWN = "Please wait 60 seconds before requesting a new code.";
const MSG_HOURLY_LIMIT = "Request limit reached. Try again in one hour.";

interface RequestOtpInputDto {
  cpf: string;
  phone: string;
  name?: string;
}

interface RequestOtpOutputDto {
  status: "sent" | "error";
  detail?: string;
}

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
        phone: dto.phone,
        ...(dto.name !== undefined ? { name: dto.name } : {}),
      },
      create: {
        cpf: dto.cpf,
        phone: dto.phone,
        name: dto.name ?? null,
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

    await prisma.userOtp.create({
      data: {
        userId: user.id,
        hash: otpHash,
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

    const lastOtp = await prisma.userOtp.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });

    if (lastOtp && lastOtp.createdAt > cooldownThreshold) {
      throw new RateLimitError(MSG_COOLDOWN);
    }

    const cpfRequestsLastHour = await prisma.userOtp.count({
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
    const lastOtpByPhone = await prisma.userOtp.findFirst({
      where: { user: { phone } },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });

    if (lastOtpByPhone && lastOtpByPhone.createdAt > cooldownThreshold) {
      throw new RateLimitError(MSG_COOLDOWN);
    }

    const phoneRequestsLastHour = await prisma.userOtp.count({
      where: { user: { phone }, createdAt: { gte: oneHourAgo } },
    });

    if (phoneRequestsLastHour >= OTP_MAX_PER_HOUR) {
      throw new RateLimitError(MSG_HOURLY_LIMIT);
    }
  }
}
