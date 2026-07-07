'use client';

import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

import {
  getOperacaoIcon,
  getMalhaChipProps,
  getDasPagoChipProps,
} from '../utils/serpro-declaracoes';

// ----------------------------------------------------------------------

export function FiscalOperacaoRow({ row, onEmitDas, showCompetencia = false }) {
  const theme = useTheme();

  const dasChip = getDasPagoChipProps(row.dasPago);
  const malhaChip = getMalhaChipProps(row.malha);
  const icon = getOperacaoIcon(row.tipoOperacao, row.isDas);

  const emitLabel = row.numeroDas || row.dasPago === false ? 'Reemitir DAS' : 'Emitir DAS';

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      alignItems={{ xs: 'flex-start', md: 'center' }}
      spacing={2}
      sx={{
        p: { xs: 2, sm: 3 },
        transition: 'background-color 0.2s',
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <Avatar
        variant="rounded"
        sx={{
          width: 48,
          height: 48,
          flexShrink: 0,
          bgcolor: alpha(row.isDas ? theme.palette.warning.main : theme.palette.primary.main, 0.12),
          color: row.isDas ? 'warning.dark' : 'primary.main',
        }}
      >
        <Iconify icon={icon} width={24} />
      </Avatar>

      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {row.tipoOperacao}
          </Typography>
          {showCompetencia && row.competenciaLabel ? (
            <Chip
              size="small"
              variant="outlined"
              label={row.competenciaLabel}
              sx={{ borderRadius: 1, fontWeight: 600 }}
            />
          ) : null}
        </Stack>

        {row.detail ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, wordBreak: 'break-word' }}>
            {row.detail}
          </Typography>
        ) : null}
      </Box>

      <Stack
        direction={{ xs: 'row', md: 'column' }}
        alignItems={{ xs: 'center', md: 'flex-end' }}
        spacing={1}
        sx={{
          width: { xs: '100%', md: 'auto' },
          flexShrink: 0,
          justifyContent: { xs: 'space-between', md: 'flex-end' },
        }}
      >
        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap justifyContent="flex-end">
          {malhaChip ? (
            <Chip size="small" variant="soft" color={malhaChip.color} label={malhaChip.label} />
          ) : null}
          {dasChip ? (
            <Chip size="small" variant="soft" color={dasChip.color} label={dasChip.label} />
          ) : null}
        </Stack>

        {row.canEmitDas ? (
          <Button
            size="small"
            variant="outlined"
            color={row.numeroDas ? 'warning' : 'primary'}
            startIcon={<Iconify icon="solar:document-add-bold-duotone" />}
            onClick={() => onEmitDas?.({ mes: row.mes, ano: row.ano })}
            sx={{ borderRadius: 1.5, whiteSpace: 'nowrap' }}
          >
            {emitLabel}
          </Button>
        ) : null}

        {row.canEmitDas && row.ultimaEmissao ? (
          <Typography variant="caption" color="text.disabled" sx={{ whiteSpace: 'nowrap' }}>
            {`Emitido por ${row.ultimaEmissao.usuarioNome || row.ultimaEmissao.usuarioEmail}`}
            {' · '}
            {dayjs(row.ultimaEmissao.emissaoEm).format('DD/MM/YYYY HH:mm')}
          </Typography>
        ) : null}
      </Stack>
    </Stack>
  );
}
