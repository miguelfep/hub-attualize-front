'use client';

// Core (MUI) imports
import { ptBR as ptBRCore } from '@mui/material/locale';
// Date pickers (MUI) imports
import { ptBR as ptBRDate } from '@mui/x-date-pickers/locales';
// Data grid (MUI) imports
import { ptBR as ptBRDataGrid } from '@mui/x-data-grid/locales';

// ----------------------------------------------------------------------

export const allLangs = [
  {
    value: 'pt',
    label: 'Portuguese',
    countryCode: 'BR',
    adapterLocale: 'pt-BR',
    numberFormat: { code: 'pt-BR', currency: 'BRL' },
    systemValue: {
      components: {
        ...ptBRCore.components,
        ...ptBRDate.components,
        ...ptBRDataGrid.components,
      },
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
