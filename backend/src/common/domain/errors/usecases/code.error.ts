/**
 * Catálogo centralizado de códigos de erro da aplicação.
 *
 * Padrão:
 * <contexto>.<motivo>.error
 *
 * Exemplos:
 * - general.bad-request.error
 * - auth.invalid-credentials.error
 * - organization.already-exists.error
 */
export enum CodeError {
  // ---------------------------------------------------------------------------
  // General / HTTP
  // ---------------------------------------------------------------------------
  BAD_REQUEST = "general.bad-request.error",
  UNAUTHORIZED = "general.unauthorized.error",
  FORBIDDEN = "general.forbidden.error",
  ACCESS_DENIED = "general.access-denied.error",
  METHOD_NOT_ALLOWED = "general.method-not-allowed.error",
  UNSUPPORTED_MEDIA_TYPE = "general.unsupported-media-type.error",
  INTERNAL_SERVER_ERROR = "general.internal-server-error.error",

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------
  VALIDATION_ERROR = "validation.failed.error",
  INVALID_PAYLOAD = "validation.invalid-payload.error",
  INVALID_FIELD = "validation.invalid-field.error",
  INVALID_SORT_FIELD = "validation.invalid-sort-field.error",
  UNPROCESSABLE_ENTITY = "validation.unprocessable-entity.error",

  // ---------------------------------------------------------------------------
  // Resource
  // ---------------------------------------------------------------------------
  NOT_FOUND = "resource.not-found.error",
  ENTITY_NOT_FOUND = "resource.entity-not-found.error",
  ALREADY_EXISTS = "resource.already-exists.error",
  DUPLICATE_RECORD = "resource.duplicate-record.error",

  // ---------------------------------------------------------------------------
  // Conflict / Integrity
  // ---------------------------------------------------------------------------
  CONFLICT = "conflict.operation-conflict.error",
  INTEGRITY_VIOLATION = "conflict.integrity-violation.error",
  DATA_INTEGRITY_VIOLATION = "conflict.data-integrity-violation.error",

  // ---------------------------------------------------------------------------
  // Auth / Account / User
  // ---------------------------------------------------------------------------
  USER_NOT_FOUND = "user.not-found.error",
  USER_ALREADY_EXISTS = "user.already-exists.error",
  USER_INVALID_DATA = "user.invalid-data.error",
  INVALID_CREDENTIALS = "auth.invalid-credentials.error",
  INVALID_TOKEN = "auth.invalid-token.error",
  INVALID_AUTHENTICATION = "auth.invalid-authentication.error",
  EMAIL_NOT_FOUND = "auth.email-not-found.error",

  // ---------------------------------------------------------------------------
  // External services
  // ---------------------------------------------------------------------------
  WHATSAPP_SERVICE_ERROR = "external.whatsapp-service.error",
  RATE_LIMIT_EXCEEDED = "external.rate-limit-exceeded.error",
}
