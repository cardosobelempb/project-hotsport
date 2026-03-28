import { prisma } from '../../../lib/db.js';
import { mapPlan, type PlanOutputDto } from '../../domain/index.js';

export class GetPlans {
  async execute(): Promise<PlanOutputDto[]> {
    const plans = await prisma.plan.findMany({ orderBy: { id: 'asc' } });
    return plans.map(mapPlan);
  }
}
