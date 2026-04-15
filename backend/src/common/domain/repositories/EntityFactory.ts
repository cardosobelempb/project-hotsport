/**
 * Factory responsável por criar entidades válidas.
 */
export abstract class EntityFactory<TEntity, CreateProps> {
  abstract create(props: CreateProps): TEntity
}
