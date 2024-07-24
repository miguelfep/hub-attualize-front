/* eslint-disable perfectionist/sort-imports */

'use client';

import 'dayjs/locale/en';
import 'dayjs/locale/vi';
import 'dayjs/locale/fr';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/ar-sa';
import 'dayjs/locale/pt-br'; // Adicionar a localização para pt-br

import dayjs from 'dayjs';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider as Provider } from '@mui/x-date-pickers/LocalizationProvider';

import { useTranslate } from './use-locales';
import { allLangs } from './all-langs';

// ----------------------------------------------------------------------

export function LocalizationProvider({ children }) {
  const { currentLang: currentLangValue } = useTranslate();

  const langConfig = allLangs.find((lang) => lang.value === currentLangValue) || allLangs[0];

  dayjs.locale(langConfig.adapterLocale);

  return (
    <Provider dateAdapter={AdapterDayjs} adapterLocale={langConfig.adapterLocale}>
      {children}
    </Provider>
  );
}
