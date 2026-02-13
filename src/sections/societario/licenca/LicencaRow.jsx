import { useMemo } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

const getStatusProps = (status) => {
  const statusMap = {
    valida: { label: 'Válida', color: 'success', icon: 'solar:shield-check-bold-duotone' },
    vencida: { label: 'Vencida', color: 'error', icon: 'solar:shield-cross-bold-duotone' },
    dispensada: { label: 'Dispensada', color: 'info', icon: 'solar:shield-user-bold-duotone' },
    a_expirar: { label: 'A Expirar', color: 'warning', icon: 'solar:sort-by-time-bold' },
    em_processo: { label: 'Em Processo', color: 'secondary', icon: 'solar:shield-bold-duotone' },
  };
  // Fallback seguro com 'grey' para evitar erros
  return (
    statusMap[status] || { label: status, color: 'grey', icon: 'solar:sort-by-time-bold' }
  );
};

const formatDate = (dateString) => new Date(dateString).toLocaleDateString('pt-BR');

const useValidityInfo = (startDate, endDate, status) => 
  useMemo(() => {
    if (status === 'dispensada') {
      return { countdownText: null, countdownColor: 'default' };
    }

    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    const daysRemaining = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysRemaining < 0) {
      return { countdownText: `Vencida há ${Math.abs(daysRemaining)} dias`, countdownColor: 'error' };
    }
    if (daysRemaining === 0) {
      return { countdownText: 'Vence hoje', countdownColor: 'warning' };
    }
    if (daysRemaining <= 30) {
      return { countdownText: `Vence em ${daysRemaining} dias`, countdownColor: 'warning' };
    }
    return { countdownText: `Vence em ${daysRemaining} dias`, countdownColor: 'success' };
  }, [endDate, status]);

export function LicencaRow({ licenca, onDownload }) {
  const theme = useTheme();
  const { color, icon, label } = getStatusProps(licenca.status);
  const { countdownText, countdownColor } = useValidityInfo(
    licenca.dataInicio,
    licenca.dataVencimento,
    licenca.status
  );

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        transition: theme.transitions.create(['box-shadow', 'border-color']),
        '&:hover': {
          boxShadow: theme.customShadows.z16,
          borderColor: theme.palette[color] ? `${color}.main` : 'divider',
        },
      }}
    >
      {/* SEÇÃO SUPERIOR */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ sm: 'center' }}
        justifyContent="space-between"
        spacing={2}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            sx={{
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              color: `${color}.main`,
              bgcolor: alpha(theme.palette[color]?.main || theme.palette.grey[500], 0.08),
            }}
          >
            <Iconify icon={icon} width={24} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {licenca.nome}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {licenca.cidade} - {licenca.estado}
            </Typography>
          </Box>
        </Stack>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ flexShrink: 0, width: { xs: '100%', sm: 'auto' } }}
        >
          {countdownText && (
            <Chip
              label={countdownText}
              color={countdownColor}
              size="small"
              variant="outlined"
            />
          )}
          <Chip label={label} color={color} sx={{ width: { xs: '100%', sm: 110 } }} />
          {licenca.arquivo && (
            <Button
              variant="contained"
              startIcon={<Iconify icon="solar:download-bold" />}
              onClick={() => onDownload(licenca._id, licenca.nome)}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              Baixar
            </Button>
          )}
        </Stack>
      </Stack>

      <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

      <Grid container spacing={2} rowSpacing={1}>
        <Grid xs={6} sm={3}>
          <Typography variant="caption" color="text.secondary">Início</Typography>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>{formatDate(licenca.dataInicio)}</Typography>
        </Grid>
        <Grid xs={6} sm={3}>
          <Typography variant="caption" color="text.secondary">Vencimento</Typography>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>{formatDate(licenca.dataVencimento)}</Typography>
        </Grid>
        <Grid xs={6} sm={3}>
          <Typography variant="caption" color="text.secondary">Cidade</Typography>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>{licenca?.cidade || '-'}</Typography>
        </Grid>
        <Grid xs={6} sm={1}>
          <Typography variant="caption" color="text.secondary">UF</Typography>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>{licenca?.estado || '-'}</Typography>
        </Grid>
      </Grid>
    </Paper>
  );
}
