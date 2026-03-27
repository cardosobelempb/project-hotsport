import { UUIDVO } from '../values-objects'

/**
 * DomainEventAbstract
 *
 * - Define o contrato básico para um Evento de Domínio (DDD).
 * - Todos os eventos devem ter:
 *   - Um ID de agregado (Aggregate Root)
 *   - Um timestamp indicando quando o evento ocorreu
 *
 * Boas práticas aplicadas:
 * - Propriedades agora são readonly → eventos devem ser imutáveis.
 * - Nome padronizado: "occurredAt" em vez de "ocurredAt".
 * - Getter explícito para aggregateId reforça imutabilidade.
 */
export abstract class EventDomain {
  /** Timestamp exato em que o evento ocorreu — eventos devem ser imutáveis. */
  public abstract readonly occurredAt: Date

  /**
   * Retorna o identificador do agregado ao qual o evento pertence.
   * Geralmente usado pelo EventDispatcher / Outbox pattern.
   */
  public abstract getAggregateId(): UUIDVO
}
