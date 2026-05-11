import { PageRepository } from "@/common/domain/repositories/page-repository";
import { AccountEntity } from "@/modulos/identity/domain/entities/account.entity";

export abstract class VerificationTokenRepository extends PageRepository<AccountEntity> {}
