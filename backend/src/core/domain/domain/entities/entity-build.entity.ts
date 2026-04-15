/**
 * Factory responsável por criar entidades válidas.
 */
export abstract class BaseEntityBuild<TEntity, CreateProps> {
  abstract create(props: CreateProps): TEntity;
}
