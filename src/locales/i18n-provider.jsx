'use client';

import i18next from 'i18next';
import { useMemo } from 'react';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next, I18nextProvider as Provider } from 'react-i18next';

import { i18nOptions, fallbackLng } from './config-locales';

// ----------------------------------------------------------------------

/**
 * App travado em pt-BR — sem LanguageDetector (cookie/localStorage/navegador).
 * Mantém i18next inicializado porque utilitários (format-number, theme) ainda
 * consultam `i18next.resolvedLanguage`.
 */
i18next
  .use(initReactI18next)
  .use(resourcesToBackend((lang, ns) => import(`./langs/${lang}/${ns}.json`)))
  .init(i18nOptions(fallbackLng));

// ----------------------------------------------------------------------

export function I18nProvider({ lang, children }) {
  useMemo(() => {
    const target = lang || fallbackLng;
    if (i18next.language !== target) {
      i18next.changeLanguage(target);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Provider i18n={i18next}>{children}</Provider>;
}
