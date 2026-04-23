import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import { BillingCycle } from "@/modulos/subscription/domain/enums/biling-cycle.enum";
import {
  SubscriptionPlanOutputDto,
  SubscriptionPlanRawDto,
} from "../../application/dto/subscription-plan.dto";
import { SubscriptionPlanEntity } from "../entities/subscription-plan.entity";

export class SubscriptionPlanMapper {
  static toDomain(raw: SubscriptionPlanRawDto): SubscriptionPlanEntity {
    return SubscriptionPlanEntity.create(
      {
        organizationId: UUIDVO.create(raw.organizationId),
        code: raw.code,
        name: raw.name,
        description: raw.description,
        billingCycle: raw.billingCycle as BillingCycle,
        amount: raw.amount,
        currency: raw.currency,
        trialDays: raw.trialDays,
        sortOrder: raw.sortOrder,
        isPublic: raw.isPublic,
        isDefault: raw.isDefault,
      },
      UUIDVO.create(raw.id),
    );
  }

  static toOutput(entity: SubscriptionPlanEntity): SubscriptionPlanOutputDto {
    return {
      id: entity.id.getValue(),
      organizationId: entity.organizationId.getValue(),
      code: entity.code,
      name: entity.name,
      description: entity.description,
      billingCycle: entity.billingCycle,
      amount: entity.amount,
      currency: entity.currency,
      trialDays: entity.trialDays,
      sortOrder: entity.sortOrder,
      isPublic: entity.isPublic,
      isDefault: entity.isDefault,
      status: entity.status,
      createdAt: entity.createdAt.toISOString(),
    };
  }
}
