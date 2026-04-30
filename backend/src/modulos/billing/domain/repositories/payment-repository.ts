import { RepositorySearchable } from "@/common";

import { PaymentEntity } from "../../../domain/entities/payment.entity";

export abstract class PaymentRepository extends RepositorySearchable<PaymentEntity> {}
