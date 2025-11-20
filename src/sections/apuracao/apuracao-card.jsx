'use client';

import PropTypes from 'prop-types';

import {
  Card,
  Stack,
  Typography,
  Chip,
  Button,
  Divider,
  Box,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { formatarPeriodo } from 'src/types/apuracao';

// ----------------------------------------------------------------------

export function ApuracaoCard({ apuracao, onView }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'calculada':
        return 'info';
      case 'validada':
        return 'primary';
      case 'das_gerado':
        return 'success';
      case 'pago':
        return 'success';
      case 'cancelada':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'calculada':
        return 'Calculada';
      case 'validada':
        return 'Validada';
      case 'das_gerado':
        return 'DAS Gerado';
      case 'pago':
        return 'Pago';
      case 'cancelada':
        return 'Cancelada';
      default:
        return status;
    }
  };

  return (
    <Card sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'primary.lighter',
                color: 'primary.main',
              }}
            >
              <Iconify icon="solar:document-text-bold-duotone" width={28} />
            </Box>
            <Stack>
              <Typography variant="subtitle1">
                Período: {formatarPeriodo(apuracao.periodoApuracao)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Calculado em{' '}
                {new Date(apuracao.calculadoEm).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </Typography>
            </Stack>
          </Stack>
          <Chip
            label={getStatusLabel(apuracao.status)}
            color={getStatusColor(apuracao.status)}
            size="small"
          />
        </Stack>

        <Divider />

        <Stack direction="row" spacing={3}>
          <Stack flex={1}>
            <Typography variant="caption" color="text.secondary">
              Receita Bruta
            </Typography>
            <Typography variant="h6">
              R$ {apuracao.totalReceitaBruta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </Typography>
          </Stack>
          <Stack flex={1}>
            <Typography variant="caption" color="text.secondary">
              Total Impostos
            </Typography>
            <Typography variant="h6" color="error.main">
              R$ {apuracao.totalImpostos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </Typography>
          </Stack>
          <Stack flex={1}>
            <Typography variant="caption" color="text.secondary">
              Alíquota Efetiva
            </Typography>
            <Typography variant="h6">
              {apuracao.aliquotaEfetivaTotal.toFixed(2)}%
            </Typography>
          </Stack>
        </Stack>

        {apuracao.fatorR && (
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{
              p: 1.5,
              borderRadius: 1,
              bgcolor: apuracao.fatorR.aplicavelAnexoIII ? 'success.lighter' : 'warning.lighter',
            }}
          >
            <Iconify
              icon={
                apuracao.fatorR.aplicavelAnexoIII
                  ? 'solar:check-circle-bold-duotone'
                  : 'solar:info-circle-bold-duotone'
              }
              width={20}
              sx={{
                color: apuracao.fatorR.aplicavelAnexoIII ? 'success.main' : 'warning.main',
              }}
            />
            <Typography variant="caption">
              Fator R: {apuracao.fatorR.percentual.toFixed(2)}% -{' '}
              {apuracao.fatorR.aplicavelAnexoIII ? 'Anexo III' : 'Anexo V'}
            </Typography>
          </Stack>
        )}

        <Button
          variant="outlined"
          size="small"
          endIcon={<Iconify icon="solar:arrow-right-linear" />}
          onClick={onView}
        >
          Ver Detalhes
        </Button>
      </Stack>
    </Card>
  );
}

ApuracaoCard.propTypes = {
  apuracao: PropTypes.object.isRequired,
  onView: PropTypes.func,
};

