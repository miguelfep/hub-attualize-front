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

export function DasCard({ das, onView, onDownload }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'gerado':
        return 'warning';
      case 'pago':
        return 'success';
      case 'cancelado':
        return 'error';
      case 'vencido':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'gerado':
        return 'Pendente';
      case 'pago':
        return 'Pago';
      case 'cancelado':
        return 'Cancelado';
      case 'vencido':
        return 'Vencido';
      default:
        return status;
    }
  };

  // Formatar data de vencimento AAAAMMDD -> DD/MM/AAAA
  const formatarDataVencimento = (data) => {
    if (!data || data.length !== 8) return data;
    const ano = data.substring(0, 4);
    const mes = data.substring(4, 6);
    const dia = data.substring(6, 8);
    return `${dia}/${mes}/${ano}`;
  };

  const isVencido = () => {
    if (!das.dataVencimento) return false;
    const hoje = new Date();
    const vencimento = new Date(
      parseInt(das.dataVencimento.substring(0, 4), 10),
      parseInt(das.dataVencimento.substring(4, 6), 10) - 1,
      parseInt(das.dataVencimento.substring(6, 8), 10)
    );
    return vencimento < hoje && das.status === 'gerado';
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
                bgcolor: 'warning.lighter',
                color: 'warning.main',
              }}
            >
              <Iconify icon="solar:bill-list-bold-duotone" width={28} />
            </Box>
            <Stack>
              <Typography variant="subtitle1">
                DAS {formatarPeriodo(das.periodoApuracao)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Documento: {das.numeroDocumento}
              </Typography>
            </Stack>
          </Stack>
          <Stack alignItems="flex-end" spacing={0.5}>
            <Chip
              label={getStatusLabel(das.status)}
              color={getStatusColor(isVencido() ? 'vencido' : das.status)}
              size="small"
            />
            {das.ambiente === 'teste' && (
              <Chip label="TESTE" color="default" size="small" variant="outlined" />
            )}
          </Stack>
        </Stack>

        <Divider />

        <Stack direction="row" spacing={3}>
          <Stack flex={1}>
            <Typography variant="caption" color="text.secondary">
              Vencimento
            </Typography>
            <Typography variant="subtitle2" color={isVencido() ? 'error.main' : 'text.primary'}>
              {formatarDataVencimento(das.dataVencimento)}
            </Typography>
          </Stack>
          <Stack flex={1}>
            <Typography variant="caption" color="text.secondary">
              Valor Principal
            </Typography>
            <Typography variant="subtitle2">
              R$ {das.valores.principal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </Typography>
          </Stack>
          <Stack flex={1}>
            <Typography variant="caption" color="text.secondary">
              Total a Pagar
            </Typography>
            <Typography variant="subtitle2" color="error.main">
              R$ {das.valores.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </Typography>
          </Stack>
        </Stack>

        {isVencido() && (
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{
              p: 1.5,
              borderRadius: 1,
              bgcolor: 'error.lighter',
            }}
          >
            <Iconify
              icon="solar:danger-circle-bold-duotone"
              width={20}
              sx={{ color: 'error.main' }}
            />
            <Typography variant="caption" color="error.main">
              DAS vencido! Podem ser acrescidos juros e multa.
            </Typography>
          </Stack>
        )}

        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            size="small"
            fullWidth
            endIcon={<Iconify icon="solar:arrow-right-linear" />}
            onClick={onView}
          >
            Ver Detalhes
          </Button>
          {onDownload && (
            <Button
              variant="contained"
              size="small"
              fullWidth
              startIcon={<Iconify icon="solar:download-bold-duotone" />}
              onClick={onDownload}
            >
              Baixar PDF
            </Button>
          )}
        </Stack>
      </Stack>
    </Card>
  );
}

DasCard.propTypes = {
  das: PropTypes.object.isRequired,
  onView: PropTypes.func,
  onDownload: PropTypes.func,
};

