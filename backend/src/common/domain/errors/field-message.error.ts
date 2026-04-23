export interface FieldMessageProps {
  fieldName: string
  message: string
}

/**
 * Representa uma mensagem de erro associada a um campo específico.
 * Ex: validações de formulário ou payload de API.
 *
 * Este objeto é imutável por design.
 */
export class FieldMessage {
  readonly fieldName: string
  readonly message: string

  constructor(props: FieldMessageProps) {
    this.fieldName = props.fieldName
    this.message = props.message
  }
}
