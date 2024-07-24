'use client';

// core (MUI)
import { ptBR as ptBRCore } from '@mui/material/locale';
// date pickers (MUI)
import { ptBR as ptBRDate } from '@mui/x-date-pickers/locales';
// data grid (MUI)
import { ptBR as ptBRDataGrid } from '@mui/x-data-grid/locales';

// ----------------------------------------------------------------------

export const allLangs = [
  {
    value: 'pt',
    label: 'Portuguese',
    countryCode: 'BR',
    adapterLocale: 'pt-br',
    numberFormat: { code: 'pt-BR', currency: 'BRL' },
    systemValue: {
      components: { ...ptBRCore.components, ...ptBRDate.components, ...ptBRDataGrid.components },
    },
  },
];

/**
 * Country code:
 * https://flagcdn.com/en/codes.json
 *
 * Number format code:
 * https://gist.github.com/raushankrjha/d1c7e35cf87e69aa8b4208a8171a8416
 */
