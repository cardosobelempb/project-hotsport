// localeContent.ts
export const localeContent = {
  pt: {
    messages: {},
    placeholders: {},
    titles: {},
    descriptions: {},
    buttons: {},
    errors: {
      unknown: 'Erro desconhecido',
      duplicateCheckin: 'Check-in já realizado',
    },
    labels: {},
    httpErrors: {
      404: 'Página não encontrada',
      500: 'Erro interno do servidor',
    },
  },
  en: {
    messages: {},
    placeholders: {},
    titles: {},
    descriptions: {},
    buttons: {},
    errors: {
      unknown: 'Unknown error',
      duplicateCheckin: 'Check-in already completed',
    },
    labels: {},
    httpErrors: {
      404: 'Page not found',
      500: 'Internal server error',
    },
  },
  // outros idiomas se existirem
};

export type SupportedLocales = keyof typeof localeContent;
