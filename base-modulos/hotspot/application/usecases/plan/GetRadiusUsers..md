import { prisma } from "../../lib/db.js";
import {
  mapRadiusUser,
  type RadiusUserOutputDto,
} from "./radius-user-output.mapper.js";

export class GetRadiusUsers {
  async execute(): Promise<RadiusUserOutputDto[]> {
    const users = await prisma.radiusUser.findMany({ orderBy: { id: "desc" } });
    return users.map(mapRadiusUser);
  }
}
