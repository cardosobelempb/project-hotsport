import { CreateMikrotikInputDto } from "../dto/create-mikrotik.input.ts.js";

import {
  Either,
  left,
  right,
} from "@/core/domain/errors/handle-errors/either.js";
import { AlreadyExistsError } from "@/core/domain/errors/usecases/already-exists.error.js";
import { UUIDVO } from "@/core/domain/values-objects/uuidvo/uuid.vo.js";
import { MikrotikRepository } from "@/modulos/mikrotik/domain/repositories/mikrotik.repository";
import { MikrotikEntity } from "../../domain/entities/mikrotik-entity.js";
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
      return left(new AlreadyExistsError(input.macAddress));
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
