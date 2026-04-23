import { UUIDVO } from "../../values-objects/uuidvo/uuid.vo";
import { BaseAggregate } from "../entities/base-agregate.entity";

import { BaseEvent } from "./base.event";

/**
 * Callback tipado para eventos de domínio
 */
export type DomainEventCallback<E extends BaseEvent = BaseEvent> = (
  event: E,
) => void;

/**
 * Mapa de handlers por nome do evento
 */
type HandlersMap = Record<string, Array<DomainEventCallback<BaseEvent>>>;

/**
 * Events
 *
 * Event Bus de domínio responsável por:
 * - Registrar handlers
 * - Controlar Unit of Work (aggregates com eventos)
 * - Despachar eventos de forma controlada
 *
 * Observação:
 * - Implementação estática por simplicidade
 * - Pode evoluir para serviço injetável futuramente
 */
export class BaseBuildEvent {
  // ---------------------------------------------------------------------------
  // STATE
  // ---------------------------------------------------------------------------

  /** Handlers registrados por evento */
  private static handlers: HandlersMap = {};

  /** Aggregates com eventos pendentes */
  private static markedAggregates: BaseAggregate<unknown>[] = [];

  /** Flag de controle (útil para testes) */
  public static shouldRun = true;

  // ---------------------------------------------------------------------------
  // REGISTRATION
  // ---------------------------------------------------------------------------

  /**
   * Registra um handler para um tipo de evento
   */
  public static register<E extends BaseEvent>(
    eventName: string,
    callback: DomainEventCallback<E>,
  ): void {
    const handlers = this.handlers[eventName] ?? [];

    this.handlers[eventName] = [
      ...handlers,
      callback as DomainEventCallback<BaseEvent>,
    ];
  }

  // ---------------------------------------------------------------------------
  // UNIT OF WORK
  // ---------------------------------------------------------------------------

  /**
   * Marca um aggregate para despacho posterior
   * Evita duplicação de aggregates
   */
  public static markAggregateForDispatch(
    aggregate: BaseAggregate<unknown>,
  ): void {
    const alreadyMarked = this.markedAggregates.some((a) =>
      a.id.equals(aggregate.id),
    );

    if (!alreadyMarked) {
      this.markedAggregates.push(aggregate);
    }
  }

  /**
   * Despacha todos os eventos de um aggregate específico
   */
  public static dispatchEventsForAggregate(id: UUIDVO): void {
    const aggregate = this.findAggregateById(id);

    if (!aggregate || !this.shouldRun) return;

    this.dispatchAggregateEvents(aggregate);
    aggregate.clearEvents();
    this.removeAggregate(aggregate);
  }

  // ---------------------------------------------------------------------------
  // DISPATCH
  // ---------------------------------------------------------------------------

  /**
   * Dispatch direto de um único evento
   * 👉 Ideal para testes de subscribers
   */
  public static dispatchEvent(event: BaseEvent): void {
    if (!this.shouldRun) return;

    this.dispatch(event);
  }

  /**
   * Dispatch de todos os eventos de um aggregate
   */
  private static dispatchAggregateEvents(
    aggregate: BaseAggregate<unknown>,
  ): void {
    for (const event of aggregate.domainEvents) {
      this.dispatch(event);
    }
  }

  /**
   * Dispatch de um único evento para seus handlers
   */
  private static dispatch(event: BaseEvent): void {
    const eventName = event.constructor.name;
    const handlers = this.handlers[eventName];

    if (!handlers?.length) return;

    for (const handler of handlers) {
      handler(event);
    }
  }

  // ---------------------------------------------------------------------------
  // INTERNAL HELPERS
  // ---------------------------------------------------------------------------

  private static findAggregateById(
    id: UUIDVO,
  ): BaseAggregate<unknown> | undefined {
    return this.markedAggregates.find((a) => a.id.equals(id));
  }

  private static removeAggregate(aggregate: BaseAggregate<unknown>): void {
    this.markedAggregates = this.markedAggregates.filter(
      (a) => !a.equals(aggregate),
    );
  }

  // ---------------------------------------------------------------------------
  // CLEANUP (TEST SUPPORT)
  // ---------------------------------------------------------------------------

  /**
   * Limpa todo o estado interno
   * ⚠️ Deve ser usado em afterEach de testes
   */
  public static clearAll(): void {
    this.handlers = {};
    this.markedAggregates = [];
  }
}
