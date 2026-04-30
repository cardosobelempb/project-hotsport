import { UUIDVO } from "@/common/domain/values-objects/uuidvo/uuid.vo";

import { Page } from "@/common/domain/repositories/types/pagination.types";

import { SlugVO } from "@/common/domain/values-objects/slug/slug.vo";
import { PagePresentDto } from "@/shared/dto/page-present.dto";
import { OrganizationPresenterDto } from "../../application/dto/organization.dto";

import { OrganizationPresenter } from "../../application/schemas/organization.shema";
import { OrganizationEntity } from "../entities/organization.entity";

export class OrganizationMapper {
  static toDomain(raw: OrganizationPresenterDto): OrganizationEntity {
    return OrganizationEntity.create(
      {
        name: raw.name,
        slug: SlugVO.create(raw.slug),
        logoUrl: raw.logoUrl,
      },
      UUIDVO.create(raw.id),
    );
  }

  static toHttp(entity: OrganizationEntity): OrganizationPresenterDto {
    return {
      id: entity.id.getValue(),
      name: entity.name,
      slug: entity.slug.getValue(),
      logoUrl: entity.logoUrl ?? null,
      status: entity.status ?? "unknown",
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt ?? null,
      deletedAt: entity.deletedAt ?? null,
    };
  }

  static toPresenter(entity: OrganizationEntity): OrganizationPresenter {
    return {
      id: entity.id.getValue(),
      name: entity.name,
      slug: entity.slug.getValue(),
      logoUrl: entity.logoUrl ?? null,
      status: entity.status ?? "unknown",
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt?.toISOString() ?? null,
      deletedAt: entity.deletedAt?.toISOString() ?? null,
    };
  }

  static toCreate(entity: OrganizationEntity): OrganizationPresenterDto {
    return {
      // ✅ UUIDVO → string
      id: entity.id.getValue(),

      name: entity.name,

      // ✅ SlugVO → string
      slug:
        entity.slug instanceof SlugVO ? entity.slug.getValue() : entity.slug,

      logoUrl: entity.logoUrl ?? null,
      status: entity.status ?? "unknown",

      // ✅ Date → ISO string (Fastify serializa string, não Date)
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt ?? null,
      deletedAt: entity.deletedAt ?? null,
    };
  }

  /**
   * Converte Page<TDomain> → PageResponseDto<TDto>
   * preservando todos os metadados Spring intactos.
   *
   * @param page      - Página retornada pelo use case
   * @param mapFn     - Função de transformação item a item
   */
  static toHttpPage<OrganizationEntity, OrganizationPresenterDto>(
    page: Page<OrganizationEntity>,
    mapFn: (item: OrganizationEntity) => OrganizationPresenterDto,
  ): PagePresentDto<OrganizationPresenterDto> {
    return {
      // ─── Metadados Spring preservados intactos ─────────────────────
      pageable: page.pageable,
      totalPages: page.totalPages,
      totalElements: page.totalElements,
      last: page.last,
      size: page.size,
      number: page.number,
      sort: page.sort,
      numberOfElements: page.numberOfElements,
      first: page.first,
      empty: page.empty,

      // ─── Único campo transformado ──────────────────────────────────
      content: page.content.map(mapFn),
    };
  }
}
