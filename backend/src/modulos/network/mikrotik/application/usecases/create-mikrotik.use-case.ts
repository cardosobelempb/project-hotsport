import {
  Either,
  left,
  right,
} from "@/common/domain/errors/handle-errors/either.js";
import { AlreadyExistsError } from "@/common/domain/errors/usecases/already-exists.error.js";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo.js";

import { PasswordVO } from "@/common/domain/values-objects/password/password.vo.js";
import { BcryptHasher } from "@/common/shared/cryptography/bcrypt-hasher.js";
import { MikrotikEntity } from "../../domain/entities/mikrotik-entity.js";
import { MikrotikRepository } from "../../domain/repositories/mikrotik.repository.js";

import { MikrotikMapper } from "../../domain/mappers/mikrotik-mapper.js";
import { CreateMikrotikDto, MikrotikSummaryDto } from "../dto/mikrotik.dto.js";

export type CreateMikrotikUseCaseResult = Either<
  AlreadyExistsError,
  MikrotikSummaryDto
>;

export class CreateMikrotikUseCase {
  constructor(
    private readonly mikrotikRepository: MikrotikRepository,
    private readonly bcryptHasher: BcryptHasher,
  ) {}
  async execute(
    input: CreateMikrotikDto,
  ): Promise<CreateMikrotikUseCaseResult> {
    const mikrotikExists = await this.mikrotikRepository.findByMacAddress(
      input.macAddress,
    );

    if (mikrotikExists) {
      return left(
        new AlreadyExistsError({
          fieldName: "macAddress",
          value: input.macAddress,
          message: `Mikrotik com MAC Address "${input.macAddress}" já existe`,
        }),
      );
    }

    const passwordHash = await this.bcryptHasher.hash(input.passwordHash);

    const newMikrotik = MikrotikEntity.create({
      name: input.name,
      host: input.host,
      port: input.port,
      username: input.username,
      passwordHash: new PasswordVO(passwordHash),
      ipAddress: input.ipAddress,
      macAddress: input.macAddress,
      organizationId: UUIDVO.create(input.organizationId),
    });
    const mikrotik = await this.mikrotikRepository.create(newMikrotik);

    return right(MikrotikMapper.toSummary(mikrotik));
  }
}
