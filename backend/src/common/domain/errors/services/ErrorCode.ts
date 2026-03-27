/**
 * Catálogo centralizado de códigos de erro com mensagens claras e legíveis.
 * Segue o padrão: <domínio>.<descrição>.error
 */
export enum ErrorCode {
  // ---- GENERAL ERRORS ----
  BAD_REQUEST = 'general.invalid-request.error', // A requisição está mal formatada ou incompleta
  FORBIDDEN = 'general.action-forbidden.error', // Usuário autenticado, mas sem permissão
  UNAUTHORIZED = 'general.unauthorized-access.error', // Necessário autenticação
  ACCESS_DENIED = 'general.access-denied.error', // Acesso negado por regra de segurança
  METHOD_NOT_ALLOWED = 'general.method-not-allowed.error', // Método HTTP não suportado
  NOT_ALLOWED = 'general.operation-not-allowed.error', // Operação proibida pelo sistema

  // ---- RESOURCE / ENTITY ERRORS ----
  NOT_FOUND = 'resource.not-found.error', // Recurso solicitado não existe
  ENTITY_NOT_FOUND = 'resource.entity-not-found.error', // Entidade específica não encontrada

  // ---- USER ERRORS ----
  USER_NOT_FOUND = 'user.not-found.error', // Usuário não existe
  USER_FOUND = 'user.already-exists.error', // Já existe um usuário com esses dados
  INVALID_USER = 'user.invalid-data.error', // Dados do usuário são inválidos
  INVALID_CREDENTIALS = 'user.invalid-credentials.error', // Login ou senha incorretos
  INVALID_TOKEN = 'user.invalid-token.error', // Token expirado, inválido ou corrompido
  INVALID_CREDENTIALS_OR_TOKEN = 'user.invalid-authentication.error', // Credenciais ou token inválido
  EMAIL_NOT_FOUND = 'user.email-not-found.error', // Email não cadastrado

  // ---- VALIDATION ERRORS ----
  UNPROCESSABLE_ENTITY = 'validation.data-invalid.error', // Dados enviados inválidos
  VALIDATION_ERROR = 'validation.validation-failed.error', // Erros de validação genéricos
  VALID_SORT = 'validation.invalid-sort-field.error', // Campo enviado para ordenação é inválido

  // ---- CONFLICTS & INTEGRITY ----
  CONFLICT_ERROR = 'conflict.operation-conflict.error', // Conflito em alguma operação
  DUPLICATE_ERROR = 'conflict.duplicate-record.error', // Registro já existe no sistema
  INTEGRITY_VIOLATION = 'conflict.integrity-violation.error', // Violação de integridade referencial
  DATA_INTEGRITY_VIOLATION = 'conflict.data-integrity-violation.error', // Dados conflitantes ou inválidos
  UNSUPPORTED_MEDIA_TYPE = 'unsupported.media.type.error', // Dados  formato do payload não é um formato suportado
}
