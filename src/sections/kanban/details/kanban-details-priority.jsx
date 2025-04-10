import Stack from '@mui/material/Stack';
import ButtonBase from '@mui/material/ButtonBase';

import { varAlpha } from 'src/theme/styles';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function KanbanDetailsPriority({ priority, onChangePriority }) {
  return (
    <Stack direction="row" flexWrap="wrap" spacing={1}>
      {['baixa', 'média', 'alta'].map((option) => (
        <ButtonBase
          key={option}
          onClick={() => onChangePriority(option)}
          sx={{
            py: 0.5,
            pl: 0.75,
            pr: 1.25,
            fontSize: 12,
            borderRadius: 1,
            lineHeight: '20px',
            textTransform: 'capitalize',
            fontWeight: 'fontWeightBold',
            boxShadow: (theme) =>
              `inset 0 0 0 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.24)}`,
            ...(option === priority && {
              boxShadow: (theme) => `inset 0 0 0 2px ${theme.vars.palette.text.primary}`,
            }),
          }}
        >
          <Iconify
            icon={
              (option === 'baixa' && 'solar:double-alt-arrow-down-bold-duotone') ||
              (option === 'média' && 'solar:double-alt-arrow-right-bold-duotone') ||
              'solar:double-alt-arrow-up-bold-duotone'
            }
            sx={{
              mr: 0.5,
              ...(option === 'baixa' && { color: 'info.main' }),
              ...(option === 'média' && { color: 'warning.main' }),
              ...(option === 'alta' && { color: 'error.main' }),
            }}
          />

          {option}
        </ButtonBase>
      ))}
    </Stack>
  );
}
