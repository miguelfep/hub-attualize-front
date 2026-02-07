'use client';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

import { isGuia, getCompetencia, formatCompetencia } from '../utils';

// ----------------------------------------------------------------------

const getStatusColor = (status) => {
  const statusValue = status?.statusProcessamento || status;
  const statusMap = {
    pendente: 'warning',
    processado: 'success',
    erro: 'error',
  };
  return statusMap[statusValue] || 'default';
};

const getStatusLabel = (status) => {
  const statusValue = status?.statusProcessamento || status;
  const labelMap = {
    pendente: 'Pendente',
    processado: 'Processado',
    erro: 'Erro',
  };
  return labelMap[statusValue] || statusValue || status;
};

const getTipoGuiaLabel = (tipo) => {
  const tipoMap = {
    DAS: 'DAS',
    EXTRATO_PGDAS: 'Extrato PGDAS',
    DARF: 'DARF',
    ICMS: 'ICMS',
    ISS: 'ISS',
    PIS: 'PIS',
    COFINS: 'COFINS',
    IRPJ: 'IRPJ',
    CSLL: 'CSLL',
    INSS: 'INSS',
    FGTS: 'FGTS',
    HOLERITE: 'Holerite',
    EXTRATO_FOLHA_PAGAMENTO: 'Extrato Folha',
  };
  return tipoMap[tipo] || tipo;
};

const getStatusPagamentoLabel = (statusPagamento) => {
  if (!statusPagamento) return null;
  const labelMap = {
    a_pagar: 'A Pagar',
    pago: 'Pago',
    vencido: 'Vencido',
  };
  return labelMap[statusPagamento] || statusPagamento;
};

// ----------------------------------------------------------------------

export function GuiaFiscalPortalCard({ guia, onView, onDownload, onSolicitarAtualizacao }) {
  const {
    _id,
    nomeArquivo,
    tipoGuia,
    categoria,
    dataVencimento,
    status,
    statusProcessamento,
    statusPagamento,
    dadosExtraidos,
  } = guia;

  const competencia = getCompetencia(guia);
  const isGuiaType = isGuia(categoria);

  const currentStatus = statusProcessamento || status;

  return (
    <Card
      sx={{
        p: 2,
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
          <Stack spacing={1} sx={{ flex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
              <Label variant="soft" color="info">
                {getTipoGuiaLabel(tipoGuia)}
              </Label>
              <Label variant="soft" color={getStatusColor(currentStatus)}>
                {getStatusLabel(currentStatus)}
              </Label>
              {statusPagamento && (
                <Label
                  variant="soft"
                  color={statusPagamento === 'pago' ? 'success' : statusPagamento === 'vencido' ? 'error' : 'warning'}
                >
                  {getStatusPagamentoLabel(statusPagamento)}
                </Label>
              )}
            </Stack>

            <Typography variant="subtitle2">{nomeArquivo || 'Documento'}</Typography>

            {competencia && (
              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify icon="solar:calendar-mark-bold-duotone" width={16} />
                <Typography variant="body2" color="text.secondary">
                  Competência: {formatCompetencia(competencia)}
                </Typography>
              </Stack>
            )}

            {/* Vencimento - apenas para guias (não para documentos) */}
            {isGuiaType && dataVencimento && (
              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify icon="solar:calendar-bold" width={16} />
                <Typography variant="body2" color="text.secondary">
                  Vencimento: {fDate(dataVencimento)}
                </Typography>
              </Stack>
            )}

            {dadosExtraidos?.valor && (
              <Typography variant="body2" fontWeight="medium">
                Valor: {fCurrency(dadosExtraidos.valor)}
              </Typography>
            )}
          </Stack>

          <Stack direction="row" spacing={1}>
            {onSolicitarAtualizacao && (
              <Tooltip title="Solicitar atualização desta guia">
                <IconButton
                  size="small"
                  onClick={() => onSolicitarAtualizacao(_id, tipoGuia, competencia)}
                  sx={{ color: 'warning.main' }}
                >
                  <Iconify icon="solar:refresh-bold" />
                </IconButton>
              </Tooltip>
            )}
            <IconButton
              size="small"
              onClick={() => onDownload(_id, nomeArquivo)}
              sx={{ color: 'primary.main' }}
            >
              <Iconify icon="solar:download-bold" />
            </IconButton>
            <Button
              size="small"
              variant="outlined"
              onClick={() => onView(_id)}
              endIcon={<Iconify icon="eva:arrow-forward-fill" width={16} />}
            >
              Ver
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
}
