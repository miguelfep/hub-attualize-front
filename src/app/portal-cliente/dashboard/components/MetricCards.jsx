import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

import { CARD, staggerDelay, ANIMATION_FADE_IN_UP } from './dash-tokens';

const ICON_MAP = {
  trending_up: 'solar:trending-up-bold-duotone',
  account_balance_wallet: 'solar:wallet-money-bold-duotone',
  savings: 'solar:card-bold-duotone',
  profit: 'solar:chart-2-bold-duotone',
};

export default function MetricCard({ metric, index = 0, sx, ...other }) {
  const theme = useTheme();
  const color = metric.color || 'primary';
  const iconifyIcon = ICON_MAP[metric.icon] || 'solar:chart-2-bold-duotone';

  return (
    <Card
      sx={{
        ...CARD,
        p: 2,
        minWidth: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        overflow: 'visible',
        width: '100%',
        ...ANIMATION_FADE_IN_UP,
        animationDelay: staggerDelay(index),
        animationFillMode: 'backwards',
        ...sx,
      }}
      {...other}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          flexShrink: 0,
          borderRadius: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color === 'success' ? 'success.main' : `${color}.main`,
          bgcolor:
            color === 'success'
              ? alpha(theme.palette.success.main, 0.08)
              : alpha(theme.palette[color]?.main || theme.palette.primary.main, 0.08),
        }}
      >
        <Iconify icon={iconifyIcon} width={20} />
      </Box>

      <Stack spacing={0.5} flexGrow={1} minWidth={0} overflow="hidden">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'nowrap' }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              color: 'text.secondary',
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {metric.label}
          </Typography>
          {/* Chip mostrando "Mês Atual" para Vendas */}
          {metric.mostrarChipMesAtual && (
            <Chip
              label="Mês Atual"
              color="info"
              size="small"
              sx={{
                fontSize: '0.6rem',
                height: 16,
                flexShrink: 0,
                fontWeight: 500,
                borderRadius: 1,
                '& .MuiChip-label': {
                  px: 0.5,
                  py: 0,
                  lineHeight: 1.2,
                },
              }}
            />
          )}
          {/* Chip mostrando mês dinâmico (Mês Anterior ou mês selecionado) */}
          {metric.mostrarChipExtrato && (
            <Chip
              label={metric.chipLabel || 'Mês Anterior'}
              color="warning"
              size="small"
              sx={{
                fontSize: '0.6rem',
                height: 16,
                flexShrink: 0,
                fontWeight: 500,
                borderRadius: 1,
                '& .MuiChip-label': {
                  px: 0.5,
                  py: 0,
                  lineHeight: 1.2,
                  color: 'white',
                },
              }}
            />
          )}
        </Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.02em' }}>
          {metric.value}
        </Typography>
      </Stack>
    </Card>
  );
}
