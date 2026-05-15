import { prisma } from "../../lib/db.js";
import {
  mapMikrotik,
  type MikrotikOutputDto,
} from "./mikrotik-output.mapper.js";

export class GetMikrotiks {
  async execute(): Promise<MikrotikOutputDto[]> {
    const mikrotiks = await prisma.mikrotik.findMany({
      orderBy: { id: "asc" },
    });
    return mikrotiks.map(mapMikrotik);
  }
}
