import { prisma } from "../../lib/db.js";
import {
  mapRadiusUser,
  type RadiusUserOutputDto,
} from "./radius-user-output.mapper.js";

interface CreateRadiusUserInputDto {
  username: string;
  password: string;
  planId?: number | null;
  nasId?: number | null;
}

export class CreateRadiusUser {
  async execute(dto: CreateRadiusUserInputDto): Promise<RadiusUserOutputDto> {
    await prisma.radcheck.create({
      data: {
        username: dto.username,
        attribute: "Cleartext-Password",
        op: ":=",
        value: dto.password,
      },
    });

    const user = await prisma.radiusUser.create({
      data: {
        username: dto.username,
        planId: dto.planId ?? null,
        nasId: dto.nasId ?? null,
      },
    });

    return mapRadiusUser(user);
  }
}

export type { CreateRadiusUserInputDto };
