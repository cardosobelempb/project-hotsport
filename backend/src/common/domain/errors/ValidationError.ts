import { FieldMessage } from './FieldMessage'
import { StandardError } from './StandardError'

/**
 * Erro de validação contendo múltiplos erros por campo.
 * Usado principalmente em validação de payloads (APIs REST).
 */
export class ValidationError extends StandardError {
  /**
   * Lista interna de erros de campo.
   * Mantida privada para preservar encapsulamento.
   */
  private readonly fieldErrors: FieldMessage[] = []

  constructor(path: string, statusCode = 400) {
    super({
      error: 'Validation Error',
      message: 'Dados inválidos',
      statusCode,
      path,
    })
  }

  /**
   * Adiciona um erro relacionado a um campo específico.
   */
  addFieldError(fieldName: string, message: string): void {
    this.fieldErrors.push(
      new FieldMessage({
        fieldName,
        message,
      }),
    )
  }

  /**
   * Retorna uma cópia imutável dos erros de campo.
   */
  getFieldErrors(): ReadonlyArray<FieldMessage> {
    return [...this.fieldErrors]
  }

  /**
   * Indica se existem erros de validação.
   */
  hasErrors(): boolean {
    return this.fieldErrors.length > 0
  }

  /**
   * Retorna apenas as mensagens de erro.
   * Útil para logs ou respostas simplificadas.
   */
  getErrorMessages(): string[] {
    return this.fieldErrors.map(error => error.message)
  }

  toJSON() {
    return {
      ...super.toJSON(),
      errors: this.getFieldErrors(),
    }
  }
}

/**
 *const error = new ValidationError('/api/users')

error.addFieldError('email', 'Email inválido')
error.addFieldError('password', 'Senha obrigatória')

if (error.hasErrors()) {
  throw error
}

 */
