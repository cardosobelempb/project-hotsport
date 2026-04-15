import { SearchInput, SearchOutput } from "@/common";
import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/db";
import { PaymentEntity } from "@/modulos/payment/domain/entities/payment.entity";
import { PaymentRepository } from "@/modulos/payment/domain/repositories/PaymentRepository";

import { PaymentPrismaMapper } from "../../mappers/payment-prisma.mapper";

export class PaymentPrismaRepository implements PaymentRepository {
  async search(params: SearchInput): Promise<SearchOutput<PaymentEntity>> {
    const page = params.page ?? 1;
    const perPage = params.perPage ?? 15;
    const filter = params.filter?.trim() ?? "";
    const sortDirection = params.sortDirection ?? "desc";
    const allowedSortBy = new Set<keyof Prisma.PaymentOrderByWithRelationInput>(
      [
        "id",
        "planId",
        "email",
        "planName",
        "amountCents",
        "status",
        "mercadoPagoId",
        "createdAt",
        "expiresAt",
        "updatedAt",
        "macAddress",
        "cpf",
        "ipAddress",
      ],
    );
    const sortBy =
      params.sortBy &&
      allowedSortBy.has(
        params.sortBy as keyof Prisma.PaymentOrderByWithRelationInput,
      )
        ? params.sortBy
        : "createdAt";

    const where: Prisma.PaymentWhereInput = filter
      ? {
          OR: [
            { email: { contains: filter, mode: "insensitive" } },
            { planName: { contains: filter, mode: "insensitive" } },
            { status: { contains: filter, mode: "insensitive" } },
            { macAddress: { contains: filter, mode: "insensitive" } },
            { cpf: { contains: filter, mode: "insensitive" } },
            { ipAddress: { contains: filter, mode: "insensitive" } },
          ],
        }
      : {};

    const [total, payments] = await prisma.$transaction([
      prisma.payment.count({ where }),
      prisma.payment.findMany({
        where,
        orderBy: { [sortBy]: sortDirection },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
    ]);

    return {
      items: payments.map(PaymentPrismaMapper.toDomain),
      total,
      totalPages: Math.ceil(total / perPage),
      currentPage: page,
      perPage,
      sortBy,
      sortDirection,
      filter,
    };
  }

  async findById(id: string): Promise<PaymentEntity | null> {
    const payment = await prisma.payment.findUnique({ where: { id } });
    if (!payment) return null;
    return PaymentPrismaMapper.toDomain(payment);
  }

  async save(entity: PaymentEntity): Promise<PaymentEntity> {
    const data = PaymentPrismaMapper.toPrisma(entity);
    const updateData: Prisma.PaymentUncheckedUpdateInput = {
      planId: entity.planId,
      email: entity.email ?? null,
      planName: entity.planName ?? null,
      amountCents: entity.amountCents,
      status: entity.status ?? null,
      mercadoPagoId: entity.mercadoPagoId ?? null,
      macAddress: entity.macAddress ?? null,
      cpf: entity.cpf ?? null,
      ipAddress: entity.ipAddress ?? null,
      createdAt: entity.createdAt,
      expiresAt: entity.expiresAt ?? null,
      updatedAt: entity.updatedAt,
    };

    const payment = await prisma.payment.upsert({
      where: { id: entity.id.toString() },
      create: data,
      update: updateData,
    });

    return PaymentPrismaMapper.toDomain(payment);
  }

  async delete(entity: PaymentEntity): Promise<void> {
    await prisma.payment.delete({
      where: { id: entity.id.toString() },
    });
  }
}
