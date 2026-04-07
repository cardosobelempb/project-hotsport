import { prisma } from "../../lib/db.js";
import { type LgpdOutputDto, mapLgpd } from "./lgpd-output.mapper.js";

interface RegisterLgpdConsentInputDto {
  cpf: string;
  consent: boolean;
  mac?: string;
  ip?: string;
  name?: string;
  phone?: string;
}

export class RegisterLgpdConsent {
  async execute(dto: RegisterLgpdConsentInputDto): Promise<LgpdOutputDto> {
    const record = await prisma.lgpdLogin.create({
      data: {
        cpf: dto.cpf,
        consent: dto.consent,
        mac: dto.mac ?? null,
        ip: dto.ip ?? null,
        name: dto.name ?? null,
        phone: dto.phone ?? null,
      },
    });

    return mapLgpd(record);
  }
}

export type { RegisterLgpdConsentInputDto };
