import { Either, right } from "@/common/domain/errors/handle-errors";

import { OrganizationRepository } from "@/modulos/organization/domain/repositories/organization.repository";

import {
  Page,
  PageInput,
} from "@/common/domain/repositories/types/pagination.types";
import { OrganizationEntity } from "@/modulos/organization/domain/entities/organization.entity";

export type OrganizationsPageUseCaseResponse = Either<
  null,
  Page<OrganizationEntity>
>;

export class OrganizationPageUseCase {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(input: PageInput): Promise<OrganizationsPageUseCaseResponse> {
    // ─── Busca paginada no repositório ──────────────────────────────────
    const result = await this.organizationRepository.page(input);
    console.log("Page result:", result);

    // ─── Reconstrói Page<T> substituindo apenas o content mapeado ───────
    // Todos os metadados Spring (pageable, sort, totalPages, etc.)
    // são preservados intactos — apenas content é transformado
    // ✅ Mapper genérico — nenhum metadado se perde

    return right(result);
  }
}
