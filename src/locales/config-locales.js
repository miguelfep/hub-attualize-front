export const fallbackLng = 'pt-BR';
export const languages = ['pt-BR'];
export const defaultNS = 'common';
export const cookieName = 'i18next';

// ----------------------------------------------------------------------

export function i18nOptions(lng = fallbackLng, ns = defaultNS) {
  return {
    lng,
    fallbackLng,
    ns,
    defaultNS,
    fallbackNS: defaultNS,
    supportedLngs: languages,
  };
}

// ----------------------------------------------------------------------

export const changeLangMessages = {
  'pt-BR': {
    success: 'Idioma alterado com sucesso!',
    error: 'Erro ao alterar idioma!',
    loading: 'Carregando...',
  },
};
