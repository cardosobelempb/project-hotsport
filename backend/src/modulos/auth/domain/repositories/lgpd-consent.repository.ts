import { PageRepository } from "@/common/domain/repositories/page-repository";
import { LgpdConsentsEntity } from "../entities/lgpd-consents.entity";

export abstract class LgpdConsentsRepository extends PageRepository<LgpdConsentsEntity> {}
