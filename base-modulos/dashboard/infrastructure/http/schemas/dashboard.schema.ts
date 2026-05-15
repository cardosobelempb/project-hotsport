import { z } from "zod";

export const DashboardStatsSchema = z.object({
  totalPlans: z.number().int(),
  totalMikrotiks: z.number().int(),
  totalPayments: z.number().int(),
  totalRadiusUsers: z.number().int(),
  approvedPayments: z.number().int(),
  totalRevenue: z.number(),
});
