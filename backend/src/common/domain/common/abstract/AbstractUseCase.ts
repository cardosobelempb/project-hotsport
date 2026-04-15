/**
 * Classe base para implementação de casos de uso.
 *
 * @typeParam TDeps - Objeto contendo 1 ou mais dependências (repos, gateways, serviços).
 * @typeParam TResponse - Tipo da resposta retornada pelo caso de uso.
 * @typeParam TRequest - Tipo da requisição de entrada (padrão: void).
 */
export abstract class AbstractUseCase<
  TDeps extends Record<string, any>, // garante que seja um objeto de dependências
  TResponse,
  TRequest = void
> {
  /**
   * Dependências injetadas no caso de uso.
   * Podem ser repositórios, gateways, serviços, etc.
   *
   * Ex: { userRepo, mailService, logger }
   */
  protected readonly deps: TDeps;

  constructor(deps: TDeps) {
    this.deps = deps;
  }

  /**
   * Método principal que deve ser implementado por todos os casos de uso.
   */
  abstract execute(request: TRequest): Promise<TResponse>;

  /**
   * Hook opcional para validações.
   */
  protected validate?(request: TRequest): void | never;

  /**
   * Método utilitário para padronizar erros.
   */
  protected fail(message: string): never {
    throw new Error(`[UseCase Error] ${message}`);
  }
}
