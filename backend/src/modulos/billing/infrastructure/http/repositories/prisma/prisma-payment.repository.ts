import {
  Page,
  PageInput,
  Sort,
} from "@/common/domain/repositories/types/pagination.types";
import { PaymentEntity } from "@/modulos/billing/domain/entities/payment.entity";
import { PaymentRepository } from "@/modulos/billing/domain/repositories/payment-repository";
import { Prisma, PrismaClient } from "../../../../../../../generated/prisma";
import { PrismaPaymentMapper } from "../../mappers/prisma/prisma-payment.mapper";

export class PrismaPaymentRepository implements PaymentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findManyByIds(ids: string[]): Promise<PaymentEntity[]> {
    throw new Error("Method not implemented.");
  }
  create(entity: PaymentEntity): Promise<PaymentEntity> {
    throw new Error("Method not implemented.");
  }
  exists(id: string): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  async page(params: PageInput): Promise<Page<PaymentEntity>> {
    // ─── Paginação (zero-based, padrão Spring Boot) ───────────────────────
    const pageNumber = params.page ?? 0; // Spring começa em 0, não em 1
    const size = params.size ?? 20; // Padrão Spring Data: 20
    const skip = pageNumber * size; // offset = page * size

    // ─── Ordenação (parse do formato 'campo,direção') ──────────────────────
    const [rawSortBy = "createdAt", rawSortDir = "desc"] = (
      params.sort ?? "createdAt,desc"
    ).split(",");

    const allowedSortFields: Array<
      keyof Prisma.PaymentOrderByWithRelationInput
    > = [
      "amount",
      "createdAt",
      "updatedAt",
      "dueAt",
      "paidAt",
      "failedAt",
      "refundedAt",
    ];

    // Garante que somente campos permitidos sejam usados (evita SQL injection por campo)
    const sortBy = allowedSortFields.includes(
      rawSortBy as keyof Prisma.PaymentOrderByWithRelationInput,
    )
      ? (rawSortBy as keyof Prisma.PaymentOrderByWithRelationInput)
      : "createdAt";

    // Garante que a direção seja apenas 'asc' ou 'desc'
    const sortDirection: Prisma.SortOrder =
      rawSortDir === "asc" ? "asc" : "desc";

    const isSorted = !!params.sort;

    // ─── Filtro ────────────────────────────────────────────────────────────
    const filter = params.filter?.trim() ?? "";
    const where = this.buildWhere(filter);

    // ─── Query paginada em transação atômica ──────────────────────────────
    const [totalElements, organizations] = await this.prisma.$transaction([
      this.prisma.payment.count({ where }),
      this.prisma.payment.findMany({
        where,
        orderBy: { [sortBy]: sortDirection },
        skip,
        take: size,
      }),
    ]);

    // ─── Cálculos derivados ───────────────────────────────────────────────
    const totalPages = Math.ceil(totalElements / size);
    const numberOfElements = organizations.length;
    const isFirst = pageNumber === 0;
    const isLast = pageNumber >= totalPages - 1;
    const isEmpty = numberOfElements === 0;

    // ─── Metadados de sort (espelha Sort do Spring) ───────────────────────
    const sortMeta: Sort = {
      sorted: isSorted,
      unsorted: !isSorted,
      empty: !isSorted,
    };

    // ─── Retorno no contrato Spring Data Page<T> ──────────────────────────
    return {
      content: organizations.map(PrismaPaymentMapper.toDomain),

      pageable: {
        sort: sortMeta,
        offset: skip, // posição absoluta do primeiro elemento
        pageSize: size,
        pageNumber,
        paged: true,
        unpaged: false,
      },

      sort: sortMeta,
      totalElements,
      totalPages,
      numberOfElements,
      size,
      number: pageNumber, // 'number' é o nome do campo no Spring (página atual)
      first: isFirst,
      last: isLast,
      empty: isEmpty,
    };
  }
  private buildWhere(filter: string): Prisma.PaymentWhereInput {
    if (!filter) return {};

    return {
      OR: [
        { provider: { contains: filter, mode: "insensitive" } },
        { providerTransactionId: { contains: filter, mode: "insensitive" } },
        { description: { contains: filter, mode: "insensitive" } },
      ],
    };
  }

  async findById(id: string): Promise<PaymentEntity | null> {
    const payment = await this.prisma.payment.findUnique({ where: { id } });
    if (!payment) return null;
    return PrismaPaymentMapper.toDomain(payment);
  }

  async save(entity: PaymentEntity): Promise<PaymentEntity> {
    const data = PrismaPaymentMapper.toPersistence(entity);
    const updateData: Prisma.PaymentUncheckedUpdateInput = {
      ...data,
    };

    const payment = await this.prisma.payment.upsert({
      where: { id: entity.id.toString() },
      create: data,
      update: updateData,
    });

    return PrismaPaymentMapper.toDomain(payment);
  }

  async delete(entity: PaymentEntity): Promise<void> {
    await this.prisma.payment.delete({
      where: { id: entity.id.toString() },
    });
  }
}
