import { RepositorySearchable } from "@/common";

import { PaymentEntity } from "../entities/payment.entity";

export abstract class PaymentRepository extends RepositorySearchable<PaymentEntity> {}
