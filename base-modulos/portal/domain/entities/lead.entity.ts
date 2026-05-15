// ============================================================
// src/modules/portal/domain/entities/lead.entity.ts
// ============================================================

import { BaseAggregate } from "@/common/domain/entities/base-agregate.entity";
import { Optional } from "@/common/domain/types/Optional";
import { EmailVO } from "@/common/domain/values-objects/email/email.vo";
import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";

import { CpfVO } from "@/common/domain/values-objects/cpf/cpf.vo";
import { PhoneVO } from "@/common/domain/values-objects/phone/phone.vo";
import { LeadStatus } from "@/common/shared/enums/lead-status.enum";

export interface LeadProps {
  userId: UUIDVO | null;
  organizationId: UUIDVO | null;
  tenantId: UUIDVO | null;
  name?: string | null;
  email?: EmailVO | null;
  phone?: PhoneVO | null;
  cpf?: CpfVO | null;
  mac?: string | null;
  ip?: string | null;
  status: LeadStatus;
  source?: string;
  observations?: string | null;
  lgpdAccepted: boolean;
  lgpdAcceptedAt: Date | null;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export class LeadEntity extends BaseAggregate<LeadProps> {
  get userId() {
    return this.props.userId;
  }
  get organizationId() {
    return this.props.organizationId;
  }
  get tenantId() {
    return this.props.tenantId;
  }
  get name() {
    return this.props.name;
  }
  get email() {
    return this.props.email;
  }
  get phone() {
    return this.props.phone;
  }
  get cpf() {
    return this.props.cpf;
  }
  get mac() {
    return this.props.mac;
  }
  get ip() {
    return this.props.ip;
  }
  get status() {
    return this.props.status;
  }
  get source() {
    return this.props.source ?? "portal";
  }
  get observations() {
    return this.props.observations;
  }
  get lgpdAccepted() {
    return this.props.lgpdAccepted;
  }
  get lgpdAcceptedAt() {
    return this.props.lgpdAcceptedAt;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }
  get deletedAt() {
    return this.props.deletedAt;
  }

  convertToCustomer(): void {
    if (this.status === LeadStatus.NEW || this.status === LeadStatus.ACTIVE) {
      this.props.status = LeadStatus.CONVERTED;
      this.touch();
    }
  }

  markContacted(): void {
    if (this.status === LeadStatus.NEW) {
      this.props.status = LeadStatus.CONTACTED;
      this.touch();
    }
  }

  discard(): void {
    this.props.status = LeadStatus.DISCARDED;
    this.touch();
  }

  softDelete(): void {
    if (!this.isDeleted()) {
      this.props.deletedAt = new Date();
      this.touch();
    }
  }

  acceptLgpd(): void {
    if (!this.lgpdAccepted) {
      this.props.lgpdAccepted = true;
      this.props.lgpdAcceptedAt = new Date();
      this.touch();
    }
  }

  isNew(): boolean {
    return this.status === LeadStatus.NEW && !this.isDeleted();
  }

  isConvertible(): boolean {
    return (
      this.lgpdAccepted &&
      [LeadStatus.NEW, LeadStatus.CONTACTED].includes(this.status)
    );
  }

  isDeleted(): boolean {
    return this.props.deletedAt !== null;
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }

  static create(
    props: Optional<
      LeadProps,
      "createdAt" | "updatedAt" | "deletedAt" | "lgpdAcceptedAt" | "status"
    >,
    id?: UUIDVO,
  ) {
    return new LeadEntity(
      {
        ...props,
        status: props.status ?? LeadStatus.NEW,
        lgpdAcceptedAt: props.lgpdAcceptedAt ?? null,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
        deletedAt: props.deletedAt ?? null,
      },
      id,
    );
  }
}
