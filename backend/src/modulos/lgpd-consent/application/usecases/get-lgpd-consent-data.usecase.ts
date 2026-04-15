import { prisma } from "@/shared/lib/db.js";
import { type LgpdOutputDto, mapLgpd } from "./lgpd-output.mapper.js";

export class GetLgpdData {
  async execute(): Promise<LgpdOutputDto[]> {
    const records = await prisma.lgpdConsent.findMany({
      orderBy: { id: "desc" },
    });
    return records.map(mapLgpd);
  }
}
