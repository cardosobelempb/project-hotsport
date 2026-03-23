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
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(msg = 'Resource already exists') {
    super(msg, 409, 'CONFLICT_ERROR');
    this.name = 'ConflictError';
  }
}

export class ValidationError extends AppError {
  constructor(msg = 'Validation failed') {
    super(msg, 422, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class ForbiddenError extends AppError {
  constructor(msg = 'Access denied') {
    super(msg, 403, 'FORBIDDEN_ERROR');
    this.name = 'ForbiddenError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(msg = 'Unauthorized') {
    super(msg, 401, 'UNAUTHORIZED_ERROR');
    this.name = 'UnauthorizedError';
  }
}
