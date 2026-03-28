import { NotFoundError } from '../../../errors/index.js';
import { prisma } from '../../../lib/db.js';
import { mapPlan, type PlanOutputDto } from '../../domain/index.js';

export class GetPlan {
  async execute(id: number): Promise<PlanOutputDto> {
    const plan = await prisma.plan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundError('Plan not found');
    return mapPlan(plan);
  }
}
