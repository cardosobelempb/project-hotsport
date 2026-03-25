export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number = 400,
    public readonly code: string = 'APP_ERROR'
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(msg = 'Resource not found') {
    super(msg, 404, 'NOT_FOUND_ERROR');
  }
}

export class ConflictError extends AppError {
  constructor(msg = 'Resource already exists') {
    super(msg, 409, 'CONFLICT_ERROR');
  }
}

export class ValidationError extends AppError {
  constructor(msg = 'Validation failed') {
    super(msg, 422, 'VALIDATION_ERROR');
  }
}

export class ForbiddenError extends AppError {
  constructor(msg = 'Access denied') {
    super(msg, 403, 'FORBIDDEN_ERROR');
  }
}

export class UnauthorizedError extends AppError {
  constructor(msg = 'Unauthorized') {
    super(msg, 401, 'UNAUTHORIZED_ERROR');
  }
}

export class WhatsappError extends AppError {
  constructor(msg = 'Falha ao enviar mensagem via WhatsApp') {
    super(msg, 502, 'WHATSAPP_ERROR');
  }
}
