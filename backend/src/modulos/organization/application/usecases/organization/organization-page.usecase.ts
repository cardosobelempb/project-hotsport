import { OrganizationRepository } from "@/modulos/organization/domain/repositories/organization.repository";

import { Either, right } from "@/common/domain/errors/handle-errors/either";
import {
  Page,
  PageInput,
} from "@/common/domain/repositories/types/pagination.types";
import { OrganizationMapper } from "@/modulos/organization/domain/mappers/organization.mapper";
import { OrganizationSummaryDto } from "../../dto/organization.dto";

// ─── Tipo de retorno ──────────────────────────────────────────────────────────

export type OrganizationsPageUseCaseResponse = Either<
  null,
  Page<OrganizationSummaryDto> // ✅ DTO de saída, não entidade crua
>;

export class OrganizationPageUseCase {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(input: PageInput): Promise<OrganizationsPageUseCaseResponse> {
    // ─── Busca paginada no repositório ────────────────────────────────────
    const result = await this.organizationRepository.page(input);

    return right({
      ...result,
      content: result.content.map(OrganizationMapper.toPage),
    });
  }
}
