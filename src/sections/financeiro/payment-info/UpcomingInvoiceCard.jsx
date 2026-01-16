import { toast } from 'sonner';
import { m } from 'framer-motion';
import { formatDate } from 'date-fns';
import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { useStatusProps } from 'src/hooks/use-status-cobranca';

import axios from 'src/utils/axios';
import { fCurrency } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

function InvoiceActions({ boleto }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const codigoSolicitacao = boleto?.codigoSolicitacao;
  const hasPix = Boolean(boleto?.pixCopiaECola?.trim());
  const hasBoleto = Boolean(codigoSolicitacao && codigoSolicitacao !== 'undefined');

  const handleDownloadBoleto = async () => {
    if (!hasBoleto) {
      toast.error('Código do boleto inválido.');
      return;
    }

    setIsDownloading(true);

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}contratos/cobrancas/faturas/${codigoSolicitacao}/pdf`
      );

      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${response.data.pdf}`;
      link.download = `boleto_${codigoSolicitacao}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Download concluído!');
    } catch (error) {
      console.error('Erro no download:', error);

      const serverMessage = error?.response?.data?.message;
      const status = error?.response?.status;

      if (status === 404) {
        toast.warning(
          serverMessage || 'O boleto ainda está sendo gerado pelo banco. Tente em alguns instantes.'
        );
      } else {
        toast.error(serverMessage || 'Não foi possível baixar o boleto.');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const copyToClipboard = useCallback(async (text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.success('PIX copiado com sucesso!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao copiar PIX.');
    }
  }, []);

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
      <Button
        fullWidth
        variant="contained"
        color="success"
        disabled={!hasPix}
        onClick={() => copyToClipboard(boleto?.pixCopiaECola)}
        startIcon={<Iconify icon="solar:qr-code-bold" width={18} />}
      >
        Pagar com PIX
      </Button>

      <Button
        fullWidth
        variant="outlined"
        color="inherit"
        disabled={!hasBoleto || isDownloading}
        onClick={handleDownloadBoleto}
        startIcon={
          <Iconify
            icon={isDownloading ? 'svg-spinners:ring-resize' : 'solar:download-minimalistic-bold'}
            width={18}
          />
        }
      >
        {isDownloading ? 'Baixando...' : 'Baixar Boleto'}
      </Button>
    </Stack>
  );
}

// ----------------------------------------------------------------------

export function UpcomingInvoiceCard({ fatura }) {
  const theme = useTheme();

  const boleto = useMemo(() => {
    try {
      return fatura?.boleto ? JSON.parse(fatura.boleto) : null;
    } catch (error) {
      console.error('Erro ao converter JSON do boleto', error);
      return null;
    }
  }, [fatura]);

  const statusProps = useStatusProps(fatura?.status);
  const statusColor = theme.palette[statusProps?.color]?.main || theme.palette.grey[500];

  if (!fatura) {
    return (
      <Stack alignItems="center" spacing={1.5} sx={{ py: 5 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            bgcolor: (t) => alpha(t.palette.success.main, 0.1),
          }}
        >
          <Iconify icon="solar:check-circle-bold" width={24} sx={{ color: 'success.main' }} />
        </Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Tudo em dia!
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Você não possui faturas em aberto.
        </Typography>
      </Stack>
    );
  }

  const boletoNaoDisponivel = !boleto?.codigoSolicitacao && !boleto?.pixCopiaECola;

  return (
    <Box
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        border: `1px solid ${alpha(statusColor, 0.3)}`,
      }}
    >
      {/* Status Header */}
      <Box
        sx={{
          py: 1,
          px: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: statusColor,
          color: theme.palette.getContrastText(statusColor),
        }}
      >
        <Iconify icon={statusProps.icon} width={16} />
        <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.3 }}>
          {statusProps.label}
        </Typography>
      </Box>

      {/* Content */}
      <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <Box sx={{ p: 2.5 }}>
          {/* Value */}
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
            {fCurrency(fatura.valor)}
          </Typography>

          {/* Info */}
          <Stack spacing={1} sx={{ mb: 2.5 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Iconify icon="solar:calendar-bold" width={16} sx={{ color: 'text.disabled' }} />
              <Typography variant="body2" color="text.secondary">
                Vencimento: {formatDate(fatura.dataVencimento, 'dd/MM/yyyy')}
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="flex-start" spacing={1}>
              <Iconify icon="solar:document-text-bold" width={16} sx={{ color: 'text.disabled', mt: 0.25 }} />
              <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
                {fatura.observacoes}
              </Typography>
            </Stack>
          </Stack>

          {/* Actions */}
          <InvoiceActions boleto={boleto} />

          {/* Warning */}
          {boletoNaoDisponivel && (
            <Box
              sx={{
                mt: 2,
                p: 1.5,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1,
                bgcolor: (t) => alpha(t.palette.warning.main, 0.08),
              }}
            >
              <Iconify icon="solar:clock-circle-bold" width={16} sx={{ color: 'warning.main', mt: 0.25 }} />
              <Typography variant="caption" color="warning.dark">
                Boleto em processamento. Aguarde alguns minutos e atualize a página.
              </Typography>
            </Box>
          )}
        </Box>
      </m.div>
    </Box>
  );
}
