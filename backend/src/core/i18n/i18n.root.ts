import { localeContent, SupportedLocales } from './localeContent';

export class I18nRoot {
  constructor(private locale: SupportedLocales = 'pt') {
    this.locale = locale;
  }

  setLocale(locale: SupportedLocales) {
    this.locale = locale;
  }

  private get content() {
    return localeContent[this.locale] || localeContent['pt'];
  }

  get messages() {
    return this.content.messages;
  }

  get placeholders() {
    return this.content.placeholders;
  }

  get titles() {
    return this.content.titles;
  }

  get descriptions() {
    return this.content.descriptions;
  }

  get buttons() {
    return this.content.buttons;
  }

  get errors() {
    return this.content.errors;
  }

  get labels() {
    return this.content.labels;
  }

  get httpErrors(): Record<number, string> {
  return this.content.httpErrors;
}

getHttpErrorMessage(statusCode: number): string {
  return this.httpErrors[statusCode] || this.errors.unknown;
}
}

export const i18n = new I18nRoot('en')
// console.log(i18n.errors.duplicateCheckin)
