import { UUIDVO } from '../values-objects'

/**
 * Entidade base para o modelo de domínio.
 *
 * - Fornece identidade única por meio de um UUIDVO (Value Object).
 * - Garante imutabilidade do ID e controla os valores via props.
 * - Evita duplicação de lógica de igualdade entre entidades.
 *
 * @template Props Tipo das propriedades internas da entidade.
 */
export abstract class EntityDomain<Props> {
  /** Identidade única da entidade representada como Value Object */
  private readonly _id: UUIDVO

  /** Propriedades da entidade (imutáveis por convenção) */
  protected readonly props: Props

  /**
   * Cria uma nova instância de entidade.
   * - Se o ID não for informado, um novo UUIDVO é gerado.
   * - Mantém consistência e evita estados inválidos.
   */
  protected constructor(props: Props, id?: UUIDVO) {
    if (!props) {
      throw new Error('Props are required to instantiate an Entity.')
    }

    this.props = props
    this._id = id ?? UUIDVO.create(id)
  }

  /** Obtém o ID da entidade */
  get id(): UUIDVO {
    return this._id
  }

  /**
   * Compara duas entidades por identidade.
   *
   * @returns true se ambas possuem o mesmo ID
   */
  public equals(entity?: EntityDomain<unknown>): boolean {
    // Caso especial: null, undefined ou outro tipo
    if (!entity || !(entity instanceof EntityDomain)) {
      return false
    }

    // Caso especial: a própria instância
    if (entity === this) {
      return true
    }

    // Comparação por ID (regra do DDD)
    return entity.id.equals(this._id)
  }
}
