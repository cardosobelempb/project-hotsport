import { PageRepository } from "@/common/domain/repositories/page-repository";
import { Prisma } from "../../../../../generated/prisma";
import { VoucherEntity } from "../entities/voucher-entity";

export abstract class VoucherRepository extends PageRepository<VoucherEntity> {
  abstract findByCode(code: string): Promise<VoucherEntity | null>;

  abstract listByOrganization(organizationId: string): Promise<VoucherEntity[]>;

  abstract createMany(vouchers: VoucherEntity[]): Promise<void>;

  abstract createManyWithTx(
    vouchers: VoucherEntity[],
    tx: Prisma.TransactionClient,
  ): Promise<void>;
}
