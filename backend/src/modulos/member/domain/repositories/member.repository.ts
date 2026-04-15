import { BaseSearchableRepository } from "@/core/domain/repositories/base-searchable.repository";

import { Prisma } from "../../../../../generated/prisma";
import { MemberEntity } from "../entities/member-entity";

export abstract class MemberRepository extends BaseSearchableRepository<MemberEntity> {
  abstract findByEmail(email: string): Promise<boolean | null>;
  abstract findByCpf(cpf: string): Promise<boolean | null>;
  abstract createWithTx(
    entity: MemberEntity,
    tx: Prisma.TransactionClient,
  ): Promise<MemberEntity>;
}
