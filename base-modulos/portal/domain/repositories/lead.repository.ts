import { PageRepository } from "@/common/domain/repositories/page-repository";
import { LeadStatus } from "@/common/shared/enums/lead-status.enum";

/**
 * Repositório abstrato de Lead.
 * Gerencia leads capturados pelos portais.
 */
export abstract class LeadRepository<T> extends PageRepository<T> {
  // ====================== BUSCAS ======================
  abstract findByEmailOrPhone(
    email?: string,
    phone?: string,
  ): Promise<T | null>;

  // ====================== OUTROS ======================
  abstract updateStatus(leadId: string, status: LeadStatus): Promise<T>;
  abstract convertToCustomer(leadId: string): Promise<void>;
}
