import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { useStatusProps } from 'src/hooks/use-status-cobranca';

import { fCurrency } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function InvoiceHistoryCardMobile({ fatura, onDownloadBoleto }) {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);

  const boleto = useMemo(() => {
    try {
      return fatura.boleto ? JSON.parse(fatura.boleto) : null;
    } catch (error) {
      console.error('Erro ao processar o boleto', error);
      return null;
    }
  }, [fatura]);

  const { color, icon, label } = useStatusProps(fatura.status);
  const statusColor = theme.palette[color]?.main || theme.palette.grey[500];
  const canDownload = Boolean(boleto?.codigoSolicitacao || fatura.codigoSolicitacao);

  const handleDownload = async () => {
    setLoading(true);
    try {
      await onDownloadBoleto(boleto?.codigoSolicitacao || fatura.codigoSolicitacao);
    } catch (error) {
      console.error('Erro ao baixar boleto', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        mb: 1.5,
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: 'background.paper',
        border: `1px solid ${alpha(statusColor, 0.24)}`,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: alpha(statusColor, 0.48),
          boxShadow: `0 4px 12px ${alpha(statusColor, 0.12)}`,
        },
      }}
    >
      {/* Status Strip */}
      <Box
        sx={{
          py: 0.75,
          px: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: alpha(statusColor, 0.08),
          borderBottom: `1px solid ${alpha(statusColor, 0.12)}`,
        }}
      >
        <Iconify icon={icon} width={14} sx={{ color: statusColor }} />
        <Typography
          variant="caption"
          sx={{
            color: statusColor,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          {label}
        </Typography>
      </Box>

      {/* Content */}
      <Box sx={{ p: 2 }}>
        {/* Descrição */}
        <Typography
          variant="subtitle2"
          sx={{
            mb: 1.5,
            lineHeight: 1.4,
            color: 'text.primary',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {fatura.observacoes}
        </Typography>

        {/* Info Row */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            py: 1.5,
            px: 1.5,
            mb: 2,
            borderRadius: 1.5,
            bgcolor: (t) => alpha(t.palette.grey[500], 0.08),
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="solar:calendar-bold" width={16} sx={{ color: 'text.disabled' }} />
            <Box>
              <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', lineHeight: 1 }}>
                Vencimento
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {new Date(fatura.dataVencimento).toLocaleDateString('pt-BR')}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="solar:tag-price-bold" width={16} sx={{ color: 'text.disabled' }} />
            <Box>
              <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', lineHeight: 1 }}>
                Valor
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {fCurrency(fatura.valor)}
              </Typography>
            </Box>
          </Stack>
        </Stack>

        {/* Download Button */}
        <Button
          fullWidth
          size="medium"
          variant="soft"
          color="inherit"
          onClick={handleDownload}
          disabled={!canDownload || loading}
          startIcon={
            <Iconify
              icon={loading ? 'svg-spinners:ring-resize' : 'solar:download-minimalistic-bold'}
              width={18}
            />
          }
          sx={{
            fontWeight: 600,
            bgcolor: (t) => alpha(t.palette.grey[500], 0.08),
            '&:hover': {
              bgcolor: (t) => alpha(t.palette.grey[500], 0.16),
            },
            '&.Mui-disabled': {
              bgcolor: (t) => alpha(t.palette.grey[500], 0.04),
            },
          }}
        >
          {loading ? 'Baixando...' : 'Baixar Boleto'}
        </Button>
      </Box>
    </Box>
  );
}