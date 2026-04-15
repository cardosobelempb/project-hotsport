import { prisma } from "../../lib/db.js";

interface DashboardStatsOutputDto {
  totalPlans: number;
  totalMikrotiks: number;
  totalPayments: number;
  totalRadiusUsers: number;
  approvedPayments: number;
  totalRevenue: number;
}

export class GetDashboardStats {
  async execute(): Promise<DashboardStatsOutputDto> {
    const [
      totalPlans,
      totalMikrotiks,
      totalPayments,
      totalRadiusUsers,
      approvedPayments,
      revenueAggregate,
    ] = await Promise.all([
      prisma.plan.count(),
      prisma.mikrotik.count(),
      prisma.payment.count(),
      prisma.radiusUser.count(),
      prisma.payment.count({ where: { status: "approved" } }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: "approved" },
      }),
    ]);

    return {
      totalPlans,
      totalMikrotiks,
      totalPayments,
      totalRadiusUsers,
      approvedPayments,
      totalRevenue: revenueAggregate._sum.amount ?? 0,
    };
  }
}
