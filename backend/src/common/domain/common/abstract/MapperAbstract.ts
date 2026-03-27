export abstract class MapperAbstract<Entity, Persistence> {
  abstract toDomain(raw: Persistence): Entity
  abstract toPersistence(entity: Entity): Persistence
}
