export abstract class BaseMapper<Entity, Persistence> {
  abstract toDomain(raw: Persistence): Entity;
  abstract toPersistence(entity: Entity): Persistence;
}
