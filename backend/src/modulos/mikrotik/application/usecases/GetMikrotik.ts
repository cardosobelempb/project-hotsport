import { NotFoundError } from "../../errors/index.js";
import { prisma } from "../../lib/db.js";
import {
  mapMikrotik,
  type MikrotikOutputDto,
} from "./mikrotik-output.mapper.js";

export class GetMikrotik {
  async execute(id: number): Promise<MikrotikOutputDto> {
    const mikrotik = await prisma.mikrotik.findUnique({ where: { id } });
    if (!mikrotik) throw new NotFoundError("Mikrotik not found");

    return mapMikrotik(mikrotik);
  }
}
