import { CreateMikrotikInputDto } from "../dto/create-mikrotik.input.ts.js";

import {
  Either,
  left,
  right,
} from "@/common/domain/errors/handle-errors/either.js";
import { AlreadyExistsError } from "@/common/domain/errors/usecases/already-exists.error.js";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo.js";

import { MikrotikEntity } from "../../domain/entities/mikrotik-entity.js";
import { MikrotikRepository } from "../../domain/repositories/mikrotik.repository.js";
import { MikrotikMapper } from "../../infrastructure/mappers/mikrotik.mapper.js";
import { CreatMikrotikOutputDto } from "../dto/create-mikrotik.output.js";

export type CreateMikrotikUseCaseResult = Either<
  AlreadyExistsError,
  { mikrotik: CreatMikrotikOutputDto }
>;

export class CreateMikrotikUseCase {
  constructor(private readonly mikrotikRepository: MikrotikRepository) {}
  async execute(
    input: CreateMikrotikInputDto,
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

    const newMikrotik = MikrotikEntity.create({
      name: input.name,
      host: input.host,
      port: input.port,
      username: input.username,
      passwordHash: input.passwordHash,
      ipAddress: input.ipAddress,
      macAddress: input.macAddress,
      organizationId: UUIDVO.create(input.organizationId),
    });
    const mikrotik = await this.mikrotikRepository.create(newMikrotik);

    return right({ mikrotik: MikrotikMapper.toOutput(mikrotik) });
  }
}
