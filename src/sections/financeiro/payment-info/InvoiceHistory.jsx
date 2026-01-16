import { toast } from 'sonner';
import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { alpha, useTheme } from '@mui/material/styles';

import { useStatusProps } from 'src/hooks/use-status-cobranca';

import axios from 'src/utils/axios';
import { fCurrency } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';

import { InvoiceHistoryCardMobile } from './InvoiceHistoryCardMobile';

// ----------------------------------------------------------------------

const handleDownloadBoleto = async (codigoSolicitacao, setLoading) => {
  if (!codigoSolicitacao) {
    toast.error('Boleto não disponível para esta fatura.');
    return;
  }

  setLoading?.(true);

  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}contratos/cobrancas/faturas/${codigoSolicitacao}/pdf`
    );
    const { pdf } = response.data;
    const link = document.createElement('a');
    link.href = `data:application/pdf;base64,${pdf}`;
    link.download = `boleto_${codigoSolicitacao}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download do boleto concluído!');
  } catch (error) {
    console.error('Erro ao baixar o boleto:', error);
    toast.error('Erro ao baixar o boleto. Tente novamente.');
  } finally {
    setLoading?.(false);
  }
};

// ----------------------------------------------------------------------

function FaturaCard({ fatura }) {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);

  const boleto = useMemo(() => {
    try {
      return fatura.boleto ? JSON.parse(fatura.boleto) : null;
    } catch (error) {
      return null;
    }
  }, [fatura.boleto]);

  const { color, icon, label } = useStatusProps(fatura.status);
  const statusColor = theme.palette[color]?.main || theme.palette.grey[500];
  const canDownload = Boolean(boleto?.codigoSolicitacao || fatura.codigoSolicitacao);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'stretch',
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: 'background.paper',
        border: `1px solid ${alpha(statusColor, 0.2)}`,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: alpha(statusColor, 0.4),
          boxShadow: `0 4px 16px ${alpha(statusColor, 0.12)}`,
          transform: 'translateY(-1px)',
        },
      }}
    >
      <Box
        sx={{
          width: 6,
          minHeight: '100%',
          bgcolor: statusColor,
          flexShrink: 0,
        }}
      />

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          flex: 1,
          py: 2,
          px: 2.5,
          gap: 2,
        }}
      >
        <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              color: 'text.primary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {fatura.observacoes}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Iconify icon={icon} width={14} sx={{ color: statusColor }} />
            <Typography
              variant="caption"
              sx={{
                color: statusColor,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 0.3,
              }}
            >
              {label}
            </Typography>
          </Stack>
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{
            px: 2,
            py: 1,
            borderRadius: 1.5,
            bgcolor: (t) => alpha(t.palette.grey[500], 0.06),
            flexShrink: 0,
          }}
        >
          <Iconify icon="solar:calendar-bold" width={16} sx={{ color: 'text.disabled' }} />
          <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
            {new Date(fatura.dataVencimento).toLocaleDateString('pt-BR')}
          </Typography>
        </Stack>

        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            minWidth: 100,
            textAlign: 'right',
            flexShrink: 0,
          }}
        >
          {fCurrency(fatura.valor)}
        </Typography>

        <Tooltip title={canDownload ? 'Baixar Boleto' : 'Boleto não disponível'}>
          <span>
            <IconButton
              onClick={() =>
                handleDownloadBoleto(boleto?.codigoSolicitacao || fatura.codigoSolicitacao, setLoading)
              }
              disabled={!canDownload || loading}
              sx={{
                bgcolor: (t) => alpha(t.palette.grey[500], 0.15),
                '&:hover': {
                  bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
                  color: 'primary.main',
                },
                '&.Mui-disabled': {
                  bgcolor: (t) => alpha(t.palette.grey[500], 0.02),
                },
              }}
            >
              <Iconify
                icon={loading ? 'svg-spinners:ring-resize' : 'solar:download-minimalistic-bold'}
                width={18}
              />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>
    </Box>
  );
}

// ----------------------------------------------------------------------

function SectionHeader({ icon, title, count }) {
  return (
    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2.5 }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '12px',
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
        }}
      >
        <Iconify icon={icon} width={22} color="primary.main" />
      </Box>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
          {title}
        </Typography>
        {count > 0 && (
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {count} {count === 1 ? 'fatura' : 'faturas'}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

// ----------------------------------------------------------------------

export function InvoiceHistory({ faturas }) {
  const faturasOrdenadas = useMemo(() => [...faturas].reverse(), [faturas]);

  if (faturas.length === 0) {
    return (
      <Stack alignItems="center" spacing={1.5} sx={{ py: 6 }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            bgcolor: (t) => alpha(t.palette.grey[500], 0.08),
          }}
        >
          <Iconify icon="solar:history-outline" width={28} sx={{ color: 'text.disabled' }} />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          Não há outras faturas no histórico.
        </Typography>
      </Stack>
    );
  }

  return (
    <Box>
      <SectionHeader icon="solar:history-bold-duotone" title="Histórico de Faturas" count={faturas.length} />

      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {faturasOrdenadas.map((fatura) => (
          <InvoiceHistoryCardMobile
            key={fatura._id}
            fatura={fatura}
            onDownloadBoleto={handleDownloadBoleto}
          />
        ))}
      </Box>

      <Stack spacing={1.5} sx={{ display: { xs: 'none', md: 'flex' } }}>
        {faturasOrdenadas.map((fatura) => (
          <FaturaCard key={fatura._id} fatura={fatura} />
        ))}
      </Stack>
    </Box>
  );
}