export abstract class I18nAbstract {
  /**
   * Traduz uma chave usando o sistema de internacionalização.
   * @param key - A chave da tradução (ex: "errors.name.empty")
   * @param args - Argumentos para interpolação (opcional)
   */
  abstract t(key: string, args?: Record<string, any>): string

  /**
   * Altera o idioma atual.
   * @param lng - Código do idioma (ex: "en", "pt")
   */
  abstract changeLanguage(lng: string): Promise<void>

  /**
   * Retorna o idioma atual.
   */
  abstract getCurrentLanguage(): string
}
