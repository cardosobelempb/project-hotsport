import { PageRepository } from "@/common/domain/repositories/page-repository";
import { VerificationTokenEntity } from "../entities/verification-token.entity";

export abstract class VerificationTokenRepository extends PageRepository<VerificationTokenEntity> {}
