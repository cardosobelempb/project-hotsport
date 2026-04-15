/**
 * Contrato base de persistência.
 */
export abstract class BaseRepository<TEntity> {
  /**
   * Busca uma entidade pelo ID.
   */
  abstract findById(id: string): Promise<TEntity | null>;

  /**
   * Cria uma nova entidade.
   */
  abstract create(entity: TEntity): Promise<TEntity>;

  /**
   * Atualiza uma entidade existente.
   */
  abstract save(entity: TEntity): Promise<TEntity>;

  /**
   * Remove fisicamente a entidade da base.
   *
   * ⚠️ Uso restrito e consciente.
   */
  abstract delete(entity: TEntity): Promise<void>;
}
