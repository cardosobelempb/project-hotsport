// src/shared/http/prisma-context.ts

import { Prisma, PrismaClient } from "../../../../generated/prisma";

export type PrismaTransactionClient = Prisma.TransactionClient;

export type RequestWithPrisma = {
  prisma?: PrismaClient | PrismaTransactionClient;
};

/**
 * Contexto para injetar o Prisma Client nas requisições, permitindo o uso de transações.
 *
 * Exemplo de uso:
 * @Post("/")
 * @Transactional()
 * async createOrder(request: FastifyRequest) {
 *   const prisma = request.prisma!;
 *
 *   return prisma.order.create({
 *     data: {
 *       // ...
 *     },
 *   });
 * }
 * }
 */

// if (route.transaction) {
//   return prisma.$transaction(async (tx) => {
//     request.prisma = tx;

//     const result = await handler.call(controller, request, reply);

//     return result;
//   });
// }

// async createWithTransaction(
//   prisma: Prisma.TransactionClient,
//   input: CreateOrderInput
// ) {
//   const order = await prisma.order.create({
//     data: {
//       customerId: input.customerId
//     }
//   });

//   await prisma.orderItem.createMany({
//     data: input.items.map((item) => ({
//       orderId: order.id,
//       productId: item.productId,
//       quantity: item.quantity
//     }))
//   });

//   return order;
// }

// @Post("/")
// @Transactional()
// async create(request: FastifyRequest) {
//   const tx = request.prisma;

//   return this.ordersService.createWithTransaction(tx, request.body);
// }
