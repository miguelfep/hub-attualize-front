/* eslint-disable perfectionist/sort-imports */

'use client';

// Importação do idioma pt-BR para o dayjs
import 'dayjs/locale/pt-br';

import dayjs from 'dayjs';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider as Provider } from '@mui/x-date-pickers/LocalizationProvider';

import { useTranslate } from './use-locales';

// ----------------------------------------------------------------------

export function LocalizationProvider({ children }) {
  const { currentLang } = useTranslate();

  // Defina a localidade do dayjs para pt-BR
  dayjs.locale('pt-br');

  return (
    <Provider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
      {children}
    </Provider>
  );
}
