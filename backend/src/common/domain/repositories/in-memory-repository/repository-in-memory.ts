import { NotFoundError } from "../../errors/usecases/not-founde.rror";
import { UUIDVO } from "../../values-objects/uuidvo/uuid.vo";
import { PageRepository } from "../page-repository";
import { Page, PageInput } from "../types/pagination.types";

/**
 * Tipos de propriedades genéricas de uma entidade
 */
export type ModelProps = {
  id?: UUIDVO;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
  [key: string]: any;
};

/**
 * Tipos para criação de entidade
 */
export type CreateProps<Entity> = Partial<
  Omit<Entity, "id" | "createdAt" | "updatedAt" | "deletedAt">
>;

/**
 * Repositório genérico em memória
 * Útil para testes ou prototipagem
 */
export abstract class RepositoryInMemory<
  Entity extends ModelProps,
> implements PageRepository<Entity> {
  /** Armazena todas as entidades em memória */
  protected items: Entity[] = [];

  /** Campos que podem ser usados para ordenação */
  protected sortableFields: (keyof Entity)[] = [];

  /**
   * Busca entidade por ID. Retorna null se não encontrar.
   * @param id string
   */
  async findById(id: string): Promise<Entity | null> {
    try {
      return await this._get(id);
    } catch {
      return null;
    }
  }

  /**
   * Cria uma nova entidade em memória
   * Não persiste
   */
  // newEntity(props: CreateProps<Entity>): Entity {
  //   return {
  //     id: randomUUID(),
  //     createdAt: new Date(),
  //     updatedAt: new Date(),
  //     deletedAt: null,
  //     ...props,
  //   } as Entity
  // }

  /**
   * Persiste ou atualiza a entidade em memória
   */
  async save(entity: Entity): Promise<Entity> {
    if (!entity.id) {
      entity.id = UUIDVO.create();
      entity.createdAt = new Date();
    }

    // entity.updatedAt = new Date()
    const index = this.items.findIndex((item) => item.id?.equals(entity.id));

    if (index === -1) {
      this.items.push(entity);
    } else {
      this.items[index] = entity;
    }

    return entity;
  }

  /**
   * Soft delete da entidade
   */
  async delete(entity: Entity): Promise<void> {
    await this._get(entity.id?.getValue());
    const index = this.items.findIndex((item) => item.id === entity.id);

    // if (index === -1) {
    //   throw new NotFoundError(`Entity not found using id ${entity.id}`)
    // }

    this.items.splice(index, 1);
    // Agora TypeScript sabe que items[index] existe
    // this.items[index]!.deletedAt = new Date()
  }

  /**
   * Busca paginada com filtro e ordenação
   */
  async page(params: PageInput): Promise<Page<Entity>> {
    const page = params.page ?? 1;
    const perPage = params.size ?? 10;
    const sortBy = params.sort ?? "";
    const filter = params.filter ?? "";

    let filteredItems = await this.applyFilter(this.items, filter);
    const totalElements = filteredItems.length;

    filteredItems = this.applySort(filteredItems, sortBy as keyof Entity);
    const paginatedItems = await this.applyPagination(
      filteredItems,
      page,
      perPage,
    );

    return {
      content: paginatedItems,
      pageable: {
        pageNumber: page,
        pageSize: perPage,
        offset: (page - 1) * perPage,
        paged: true,
        unpaged: false,
        sort: {
          sorted: !!sortBy,
          unsorted: !sortBy,
          empty: !sortBy,
        },
      },
      totalPages: Math.ceil(totalElements / perPage),
      totalElements,
      last: page * perPage >= totalElements,
      size: perPage,
      number: page,
      sort: {
        sorted: !!sortBy,
        unsorted: !sortBy,
        empty: !sortBy,
      },
      numberOfElements: paginatedItems.length,
      first: page === 1,
      empty: paginatedItems.length === 0,
    };
  }

  /**
   * Busca entidade por ID ou lança erro
   */
  protected async _get(id: string | undefined): Promise<Entity> {
    const entity = this.items.find(
      (item) => item.id?.getValue() === id && !item.deletedAt,
    );
    if (!entity)
      throw new NotFoundError({
        fieldName: "id",
        message: `Entity not found using id ${id}`,
      });
    return entity;
  }

  /** Filtro abstrato para ser implementado nas subclasses */
  protected abstract applyFilter(
    items: Entity[],
    filter?: string,
  ): Promise<Entity[]>;

  /** Ordenação genérica e segura */
  protected applySort(
    items: Entity[],
    sortBy?: keyof Entity,
    sortDirection: "asc" | "desc" = "asc",
  ): Entity[] {
    if (!sortBy || !this.sortableFields.includes(sortBy)) return items;

    return [...items].sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "desc"
          ? bValue.localeCompare(aValue)
          : aValue.localeCompare(bValue);
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "desc" ? bValue - aValue : aValue - bValue;
      }

      return 0;
    });
  }

  /** Paginação genérica de itens */
  protected async applyPagination(
    items: Entity[],
    page: number = 1,
    perPage: number = 10,
  ): Promise<Entity[]> {
    const start = (page - 1) * perPage;
    const end = start + perPage;

    // Retorna uma cópia paginada do array
    return items.slice(start, end);
  }

  findManyByIds(ids: string[]): Promise<Entity[]> {
    throw new Error("Method not implemented.");
  }
  create(entity: Entity): Promise<Entity> {
    throw new Error("Method not implemented.");
  }
  exists(id: string): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
}
