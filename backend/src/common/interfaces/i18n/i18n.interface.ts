export interface I18n {
  t(key: string, options?: { args?: Record<string, any> }): string
}
