import { useMemo } from 'react';

import { Box, Card, Chip, Stack, Tooltip, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const formatPercent = (value) => {
  if (value === null || value === undefined) return '—';
  return `${Number(value).toFixed(1)}%`;
};

function corPorNrr(nrr) {
  if (nrr === null || nrr === undefined) return 'text.disabled';
  if (nrr >= 100) return 'success.main';
  if (nrr >= 90) return 'warning.main';
  return 'error.main';
}

function statusPorNrr(nrr) {
  if (nrr === null || nrr === undefined) return { label: 'Sem base no período', icon: 'solar:minus-circle-bold' };
  if (nrr >= 100) return { label: 'Base existente cresceu', icon: 'solar:arrow-up-bold' };
  if (nrr === 100) return { label: 'Base estável', icon: 'solar:minus-square-bold' };
  return { label: 'Base existente encolheu', icon: 'solar:arrow-down-bold' };
}

export default function NrrKpiCard({ resumo, fonte }) {
  const nrr = resumo?.nrr ?? null;
  const grr = resumo?.grr ?? null;

  const status = useMemo(() => statusPorNrr(nrr), [nrr]);
  const cor = corPorNrr(nrr);

  const reconstruido = fonte?.inicio === 'reconstrucao' || fonte?.fim === 'reconstrucao';

  return (
    <Card sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="subtitle2" color="text.secondary">
          NRR — Net Revenue Retention
        </Typography>
        {reconstruido && (
          <Tooltip title="Dado reconstruído via auditoria — menos preciso para períodos antigos.">
            <Chip
              size="small"
              color="warning"
              variant="soft"
              icon={<Iconify icon="solar:danger-triangle-bold" width={16} />}
              label="Reconstruído"
            />
          </Tooltip>
        )}
      </Stack>

      <Box sx={{ mt: 2, mb: 1 }}>
        <Typography variant="h2" sx={{ color: cor, lineHeight: 1 }}>
          {formatPercent(nrr)}
        </Typography>
      </Box>

      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: cor }}>
        <Iconify icon={status.icon} width={18} />
        <Typography variant="body2" sx={{ color: cor }}>
          {status.label}
        </Typography>
      </Stack>

      <Box sx={{ flexGrow: 1 }} />

      <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          GRR
        </Typography>
        <Chip size="small" variant="soft" color="default" label={formatPercent(grr)} />
        <Tooltip title="GRR (Gross Revenue Retention) não considera expansão; sempre ≤ 100%.">
          <Iconify icon="solar:info-circle-bold" width={16} sx={{ color: 'text.disabled' }} />
        </Tooltip>
      </Stack>
    </Card>
  );
}
