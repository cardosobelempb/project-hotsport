import { NotFoundError } from "../../errors/index.js";
import { prisma } from "../../lib/db.js";
import {
  mapMikrotik,
  type MikrotikOutputDto,
} from "./mikrotik-output.mapper.js";

interface UpdateMikrotikInputDto {
  id: number;
  name?: string;
  ip?: string;
  username?: string;
  password?: string;
  port?: number;
  hotspotAddress?: string | null;
}

export class UpdateMikrotik {
  async execute({
    id,
    ...data
  }: UpdateMikrotikInputDto): Promise<MikrotikOutputDto> {
    const exists = await prisma.mikrotik.findUnique({ where: { id } });
    if (!exists) throw new NotFoundError("Mikrotik not found");

    const mikrotik = await prisma.mikrotik.update({ where: { id }, data });
    return mapMikrotik(mikrotik);
  }
}

export type { UpdateMikrotikInputDto };
