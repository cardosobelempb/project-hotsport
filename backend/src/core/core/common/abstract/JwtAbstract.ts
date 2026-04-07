/**
 * Estrutura padrão dos tokens JWT gerados pela aplicação.
 */
export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Contrato abstrato para provedores de autenticação via JWT.
 *
 * Define métodos essenciais para criação, verificação e decodificação
 * de tokens de acesso (accessToken) e atualização (refreshToken).
 *
 * @template T - Tipo do payload contido no token (ex: { userId: string }).
 */
export abstract class JwtAbstract<T extends object> {

  /**
   * Gera um accessToken a partir do payload.
   * @param payload - Informações a serem assinadas no token.
   * @returns accessToken como string.
   */
  abstract createAccessToken(payload: T): string;
  abstract createAsyncAccessToken(payload: T): Promise<string>;

  /**
   * Gera um refreshToken a partir do payload.
   * @param payload - Informações a serem assinadas no token.
   * @returns refreshToken como string.
   */
  abstract createRefreshToken(payload: T): string;
  abstract createAsyncRefreshToken(payload: T): Promise<string>;

  /**
   * Gera accessToken e refreshToken simultaneamente.
   * @param payload - Informações a serem assinadas nos tokens.
   * @returns Objeto com accessToken e refreshToken.
   */
  abstract createTokens(payload: T): Tokens;

  /**
   * Valida um accessToken e retorna o payload se for válido.
   * @param token - Token JWT recebido do cliente.
   * @returns Payload extraído ou null se inválido.
   */
  abstract verifyAccessToken(token: string): T | null;

  /**
   * Valida um refreshToken e retorna o payload se for válido.
   * @param token - Token JWT de atualização.
   * @returns Payload extraído ou null se inválido.
   */
  abstract verifyRefreshToken(token: string): T | null;

  /**
   * Verifica se o accessToken é válido (sem retornar o payload).
   * @param token - Token JWT de acesso.
   * @returns True se válido, false se inválido.
   */
  abstract isAccessToken(token: string): boolean;

  /**
   * Verifica se o refreshToken é válido (sem retornar o payload).
   * @param token - Token JWT de atualização.
   * @returns True se válido, false se inválido.
   */
  abstract isRefreshToken(token: string): boolean;

  /**
   * Decodifica o accessToken e extrai o payload, mesmo que o token esteja expirado.
   * @param token - Token JWT de acesso.
   * @returns Payload extraído ou null se inválido.
   */
  abstract decodeAccessToken(token: string): T | null;

  /**
   * Decodifica o refreshToken e extrai o payload, mesmo que o token esteja expirado.
   * @param token - Token JWT de atualização.
   * @returns Payload extraído ou null se inválido.
   */
  abstract decodeRefreshToken(token: string): T | null;
}
