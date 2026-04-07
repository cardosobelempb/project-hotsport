/**
 * Contrato base de persistência.
 */
export abstract class Repository<TEntity> {
  /**
   * Busca uma entidade pelo ID.
   */
  abstract findById(id: string): Promise<TEntity | null>

  /**
   * Persiste uma entidade (create ou update).
   */
  abstract save(entity: TEntity): Promise<TEntity>

  /**
   * Remove fisicamente a entidade da base.
   *
   * ⚠️ Uso restrito e consciente.
   */
  abstract delete(entity: TEntity): Promise<void>
}
