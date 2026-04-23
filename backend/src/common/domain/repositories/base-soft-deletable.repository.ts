/**
 * Marca uma entidade como apta a soft delete.
 */
export interface BaseSoftDeletableRepository {
  /**
   * Data da exclusão lógica.
   * null = entidade ativa
   */
  deletedAt: Date | null;
}
