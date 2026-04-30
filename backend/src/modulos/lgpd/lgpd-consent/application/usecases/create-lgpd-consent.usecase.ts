import { Either, right } from "@/core/domain/errors/handle-errors/either.js";
import { AlreadyExistsError } from "@/core/domain/errors/usecases/already-exists.error.js";
import { UUIDVO } from "@/core/domain/values-objects/uuidvo/uuid.vo.js";
import { LgpdConsentEntity } from "../../domain/entities/lgpd-consent.entity.js";
import { LgpdConsentRepository } from "../../domain/repositories/lgpd-consent.repository.js";
import { LgpdConsentMapper } from "../../infrastructure/mappers/lgpd-consent.mapper.js";
import { CreateLgpdConsentInputDto } from "../dto/create-lgpd-input.dto.js";
import { CreateLgpdOutputDto } from "../dto/create-lgpd-output.dto.js";

export type CreateLgpdContentUseCaseResult = Either<
  AlreadyExistsError,
  { lgpdConsent: CreateLgpdOutputDto }
>;

export class CreateLgpdConsentUserCase {
  constructor(private readonly lgpdConsentRepository: LgpdConsentRepository) {}

  async execute(
    body: CreateLgpdConsentInputDto,
  ): Promise<CreateLgpdContentUseCaseResult> {
    const newLgpdConsent = LgpdConsentEntity.create({
      userId: UUIDVO.create(body.userId),
      organizationId: UUIDVO.create(body.organizationId),
      consentTerms: body.consentTerms,
      consentMarketing: body.consentMarketing,
      consentDataSharing: body.consentDataSharing,
      consentAnalytics: body.consentAnalytics,
      ipAddress: body.ipAddress,
      macAddress: body.macAddress,
      userAgent: body.userAgent,
      consentVersion: body.consentVersion,
    });
    const record = await this.lgpdConsentRepository.create(newLgpdConsent);

    return right({ lgpdConsent: LgpdConsentMapper.toOutput(record) });
  }
}
