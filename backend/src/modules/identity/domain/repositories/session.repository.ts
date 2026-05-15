import { PageRepository } from "@/common/domain/repositories/page-repository";
import { SessionEntity } from "../entities/session.entity";

export abstract class SessionRepository extends PageRepository<SessionEntity> {}
