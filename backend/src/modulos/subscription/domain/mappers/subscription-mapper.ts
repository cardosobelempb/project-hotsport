import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";
import {
  SubscriptionOutputDto,
  SubscriptionRawDto,
} from "../../application/dto/subscriptin.dto";
import { SubscriptionEntity } from "../entities/subscription.entity";
import { BillingCycle } from "../enums/biling-cycle.enum";

export class SubscriptionMapper {
  static toDomain(raw: SubscriptionRawDto): SubscriptionEntity {
    return SubscriptionEntity.create(
      {
        organizationId: UUIDVO.create(raw.organizationId),
        subscriptionPlanId: UUIDVO.create(raw.subscriptionPlanId),
        status: raw.status,
        billingCycle: raw.billingCycle as BillingCycle,
        amount: raw.amount,
        currency: raw.currency,
        trialStartsAt: raw.trialStartsAt ? new Date(raw.trialStartsAt) : null,
        trialEndsAt: raw.trialEndsAt ? new Date(raw.trialEndsAt) : null,
        startsAt: new Date(raw.startsAt),
        currentPeriodStart: new Date(raw.currentPeriodStart),
        currentPeriodEnd: new Date(raw.currentPeriodEnd),
      },
      UUIDVO.create(raw.id),
    );
  }

  static toOutput(entity: SubscriptionEntity): SubscriptionOutputDto {
    return {
      id: entity.id.getValue(),
      organizationId: entity.organizationId.getValue(),
      subscriptionPlanId: entity.subscriptionPlanId.getValue(),
      status: entity.status,
      billingCycle: entity.billingCycle,
      amount: entity.amount,
      currency: entity.currency,
      trialStartsAt: entity.trialStartsAt
        ? entity.trialStartsAt.toISOString()
        : null,
      trialEndsAt: entity.trialEndsAt ? entity.trialEndsAt.toISOString() : null,
      startsAt: entity.startsAt.toISOString(),
      currentPeriodStart: entity.currentPeriodStart.toISOString(),
      currentPeriodEnd: entity.currentPeriodEnd.toISOString(),
      canceledAt: entity.canceledAt ? entity.canceledAt.toISOString() : null,
      expiresAt: entity.expiresAt ? entity.expiresAt.toISOString() : null,
      createdAt: entity.createdAt.toISOString(),
    };
  }
}
