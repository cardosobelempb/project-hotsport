import { prisma } from "../../lib/db.js";
import {
  mapMikrotik,
  type MikrotikOutputDto,
} from "./mikrotik-output.mapper.js";

interface CreateMikrotikInputDto {
  name: string;
  ip: string;
  username: string;
  password: string;
  port?: number;
  hotspotAddress?: string | null;
}

export class CreateMikrotik {
  async execute(dto: CreateMikrotikInputDto): Promise<MikrotikOutputDto> {
    const mikrotik = await prisma.mikrotik.create({
      data: {
        name: dto.name,
        ip: dto.ip,
        username: dto.username,
        password: dto.password,
        port: dto.port ?? 8728,
        hotspotAddress: dto.hotspotAddress ?? null,
      },
    });

    return mapMikrotik(mikrotik);
  }
}

export type { CreateMikrotikInputDto };
