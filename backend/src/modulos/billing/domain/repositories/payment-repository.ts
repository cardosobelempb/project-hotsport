import { PageRepository } from "@/common/domain/repositories/page-repository";
import { PaymentEntity } from "../entities/payment.entity";

export abstract class PaymentRepository extends PageRepository<PaymentEntity> {}
