/**
 * EventHandlerAbstract
 *
 * - Classe base para handlers de eventos de domínio.
 * - Define o contrato mínimo: configurar assinaturas (subscriptions)
 *   no barramento de eventos (DomainEvents, EventBus, etc).
 *
 * Boas práticas aplicadas:
 * - Renomeado para "DomainEventHandler" para refletir o papel no DDD.
 * - Documentação clara para orientar devs júnior/pleno.
 * - Método setupSubscriptions agora expressa claramente a intenção:
 *   "registrar callbacks que escutam eventos".
 */
export abstract class EventHandler {
  /**
   * Configura todas as assinaturas deste handler.
   *
   * Regra:
   * - Este método deve registrar handlers no barramento de eventos.
   * - Geralmente chamado na camada de infraestrutura
   *   durante o bootstrap da aplicação.
   */
  public abstract setupSubscriptions(): void
}
