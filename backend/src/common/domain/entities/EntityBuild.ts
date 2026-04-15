/**
 * Factory responsável por criar entidades válidas.
 */
export abstract class EntityBuild<TEntity, CreateProps> {
  abstract create(props: CreateProps): TEntity
}
