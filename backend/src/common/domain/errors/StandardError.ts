/**
 * Erro base da aplicação.
 * Deve ser estendido por erros específicos (ValidationError, BusinessError, etc).
 */
export class StandardError extends Error {
  readonly timestamp: Date
  readonly statusCode: number
  readonly error: string
  readonly path: string

  constructor(params: {
    timestamp?: Date
    statusCode?: number
    error: string
    message: string
    path: string
  }) {
    super(params.message)

    // Garante o nome correto da classe no stack trace
    this.name = this.constructor.name

    // Captura stack trace corretamente (Node.js)
    Error.captureStackTrace(this, this.constructor)

    this.timestamp = params.timestamp ?? new Date()
    this.statusCode = params.statusCode ?? 400
    this.error = params.error
    this.path = params.path
  }

  /**
   * Serialização padrão para logs e responses HTTP.
   */
  toJSON() {
    return {
      name: this.name,
      error: this.error,
      message: this.message,
      statusCode: this.statusCode,
      path: this.path,
      timestamp: this.timestamp,
    }
  }
}
