import { prisma } from "../../lib/db.js";
import { type LgpdOutputDto, mapLgpd } from "./lgpd-output.mapper.js";

export class GetLgpdData {
  async execute(): Promise<LgpdOutputDto[]> {
    const records = await prisma.lgpdLogin.findMany({
      orderBy: { id: "desc" },
    });
    return records.map(mapLgpd);
  }
}
