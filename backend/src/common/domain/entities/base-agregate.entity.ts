import { BaseBuildEvent } from "../events/base-build.event";
import { BaseEvent } from "../events/base.event";
import { BaseEntity } from "./base.entity";

/**
 * EntityAggregate
 *
 * - Representa a raiz de um Agregado no DDD.
 * - É responsável por controlar eventos de domínio disparados
 *   durante mudanças no estado interno.
 * - Mantém encapsulação dos eventos e registra automaticamente
 *   o agregado no sistema de despacho de eventos.
 */
export abstract class BaseAggregate<Props> extends BaseEntity<Props> {
  /**
   * Lista interna de eventos de domínio pendentes.
   * Mantida privada para evitar mutações externas.
   */
  private domainEventsQueue: BaseEvent[] = [];

  /**
   * Retorna uma cópia dos eventos pendentes.
   * Boa prática: não retornar a referência interna
   * para evitar mutações externas inesperadas.
   */
  get domainEvents(): BaseEvent[] {
    return [...this.domainEventsQueue];
  }

  /**
   * Registra um evento de domínio e notifica o dispatcher global.
   *
   * Justificativa:
   * - Nome "register" expressa a intenção de "registrar no sistema".
   * - Evita confusões com métodos que apenas adicionariam ao array.
   */
  protected registerEvent(event: BaseEvent): void {
    this.domainEventsQueue.push(event);

    // Notifica o mecanismo de Domain Events
    BaseBuildEvent.markAggregateForDispatch(this);
  }

  /**
   * Limpa todos os eventos pendentes.
   * Utilizado após a publicação dos eventos.
   */
  clearEvents(): void {
    this.domainEventsQueue = [];
  }
}
