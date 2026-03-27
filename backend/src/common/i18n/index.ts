import en from './en'
import { i18n, I18nRoot } from './i18n.root'
import pt from './pt'
import { LocaleContentType, SupportedLocales } from './types'

export const localeContent: Record<SupportedLocales, LocaleContentType> = {
  pt,
  en,
}
export { i18n, I18nRoot }

