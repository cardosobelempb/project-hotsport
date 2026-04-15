/**
 * Catálogo padronizado de mensagens de validação.
 * Todas as mensagens são claras, consistentes e adequadas para exibição ao usuário.
 */
export enum ValidatorMessage {
  // ---- REQUIRED ----
  REQUIRED_FIELD = "Este campo é obrigatório.",
  REQUIRED_NUMBER = "Este campo deve conter apenas números positivos.",
  REQUIRED_PHONE = "O campo Telefone deve conter apenas dígitos.",
  REQUIRED_EMAIL = "Informe um endereço de e-mail válido.",
  REQUIRED_EMAIL_EXIST = "Este e-mail já está cadastrado.",
  REQUIRED_EXIST = "Este valor já está cadastrado.",
  NAME_EXIST = "Este nome já está cadastrado.",
  REQUIRED_PRICE_POSITIVE = "O preço deve ser um valor positivo.",
  REQUIRED_DATE_PRESENT = "A data informada não pode estar no futuro.",

  // ---- EMAIL ----
  INVALID_EMAIL = "O e-mail informado não é válido.",

  // ---- LENGTH ----
  MIN_LENGTH = "O valor informado é menor do que o tamanho mínimo permitido.",
  MAX_LENGTH = "O valor informado é maior do que o tamanho máximo permitido.",
  BETWEEN_LENGTH = "O valor deve ter entre 5 e 15 caracteres.",

  // ---- NUMERIC ----
  MIN_VALUE = "O valor informado é menor do que o permitido.",
  MAX_VALUE = "O valor informado é maior do que o permitido.",

  // ---- GENERAL FORMAT ----
  INVALID_FORMAT = "O formato informado é inválido.",
  INVALID_ORDER_BY = "O campo orderBy contém um valor inválido.",

  // ---- DATE ----
  INVALID_ORDER_DATE = "A data informada é inválida.",
  DATE_IN_THE_PAST = "A data não pode estar no passado.",
  EXCEEDS_DURATION = "O valor informado excede a duração permitida.",
  DATE_OVERLAP = "Existe conflito entre as datas informadas.",

  // ---- DUPLICATE ----
  DUPLICATE_VALUE = "Este valor já está cadastrado.",

  // ---- UUID ----
  INVALID_UUID = "O identificador informado não é válido.",
  REQUIRED_UUID = "O identificador é obrigatório.",

  // ---- AUTH ----
  INVALID_CREDENTIALS = "E-mail ou senha incorretos.",
  PASSWORDS_DO_NOT_MATCH = "As senhas informadas não coincidem.",
  PASSWORD_TOO_SHORT = "A senha deve ter no mínimo 6 caracteres.",
  PASSWORD_TOO_WEAK = "A senha deve conter letras e números.",
  UNAUTHORIZED = "Você não tem permissão para acessar este recurso.",
  TOKEN_EXPIRED = "Sua sessão expirou. Faça login novamente.",
  TOKEN_INVALID = "Token de autenticação inválido.",
  TOKEN_REQUIRED = "Token de autenticação é obrigatório.",

  // ---- USER ----
  USER_NOT_FOUND = "Usuário não encontrado.",
  USER_ALREADY_EXISTS = "Este usuário já está cadastrado.",
  USER_INACTIVE = "Este usuário está inativo.",
  INVALID_CPF = "O CPF informado não é válido.",
  INVALID_PHONE = "O número de telefone informado não é válido.",
  INVALID_STATUS = "O status informado não é válido.",

  // ---- PERMISSION ----
  FORBIDDEN = "Você não tem permissão para realizar esta ação.",
  INSUFFICIENT_ROLE = "Seu perfil não possui acesso a este recurso.",

  // ---- SERVER ----
  INTERNAL_ERROR = "Ocorreu um erro interno. Tente novamente mais tarde.",
  SERVICE_UNAVAILABLE = "Serviço temporariamente indisponível.",
  TIMEOUT = "A requisição excedeu o tempo limite.",
}

/**
 * Valores padrão para limites numéricos utilizados em validações diversas.
 */
export enum ValidatorLimits {
  SIZE_MIN = 5,
  SIZE_MAX = 60,

  PASSWORD_MIN = 6,
  PASSWORD_MAX = 100,

  NAME_MIN = 1,
  NAME_MAX = 100,

  CPF_LENGTH = 11,

  PHONE_MIN = 10,
  PHONE_MAX = 20,

  UUID_LENGTH = 36,
}
