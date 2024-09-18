'use client';

import dayjs from 'dayjs';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { useRouter } from 'src/routes/hooks';

import { toast } from 'src/components/snackbar';

import { allLangs } from './all-langs';
import { changeLangMessages as messages } from './config-locales';

// ----------------------------------------------------------------------

export function useTranslate(ns) {
  const router = useRouter();
  const { t, i18n } = useTranslation(ns);

  // Foco no idioma pt-BR
  const currentLang = allLangs.find((lang) => lang.value === 'pt') || allLangs[0];

  const onChangeLang = useCallback(async () => {
    try {
      // Trocar idioma para pt-BR
      const langChangePromise = i18n.changeLanguage('pt');

      const currentMessages = messages.pt || messages.en;

      toast.promise(langChangePromise, {
        loading: currentMessages.loading,
        success: () => currentMessages.success,
        error: currentMessages.error,
      });

      // Definir o locale do dayjs para pt-BR
      dayjs.locale('pt-br');

      // Atualizar o roteamento
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  }, [i18n, router]);

  return {
    t,
    i18n,
    onChangeLang,
    currentLang,
  };
}
