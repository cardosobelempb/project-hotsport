import { BaseSearchableRepository } from "@/core/domain/repositories/base-searchable.repository";
import { Prisma } from "../../../../../generated/prisma";
import { VoucherEntity } from "../../../domain/entities/voucher-entity";

export abstract class VoucherRepository extends BaseSearchableRepository<VoucherEntity> {
  abstract findByCode(code: string): Promise<VoucherEntity | null>;

  abstract listByOrganization(organizationId: string): Promise<VoucherEntity[]>;

  abstract createMany(vouchers: VoucherEntity[]): Promise<void>;

  abstract createManyWithTx(
    vouchers: VoucherEntity[],
    tx: Prisma.TransactionClient,
  ): Promise<void>;
}
