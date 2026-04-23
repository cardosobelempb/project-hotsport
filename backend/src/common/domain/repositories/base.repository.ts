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
   * Verifica se uma entidade existe pelo ID.
   */
  abstract exists(id: string): Promise<boolean>;

  /**
   * Atualiza uma entidade existente.
   */
  abstract save(entity: TEntity): Promise<TEntity>;

  // abstract update(entity: TEntity): Promise<TEntity>;

  /**
   * Remove fisicamente a entidade da base.
   *
   * ⚠️ Uso restrito e consciente.
   */
  abstract delete(entity: TEntity): Promise<void>;
  /**
   * Remove fisicamente a entidade da base pelo ID.
   *
   * ⚠️ Uso restrito e consciente.
   */
  // abstract delete(id: string): Promise<void>;
}
