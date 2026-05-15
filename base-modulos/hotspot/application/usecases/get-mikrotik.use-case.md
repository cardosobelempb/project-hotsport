import { NotFoundError } from "@/core/domain/errors/usecases/not-founde.rror.js";
import { prisma } from "@/shared/lib/db.js";
import {
  mapMikrotik,
  type MikrotikOutputDto,
} from "./mikrotik-output.mapper.js";

export class GetMikrotik {
  async execute(id: string): Promise<MikrotikOutputDto> {
    const mikrotik = await prisma.mikrotik.findUnique({ where: { id } });
    if (!mikrotik) throw new NotFoundError("Mikrotik not found");

    return mapMikrotik(mikrotik);
  }
}
