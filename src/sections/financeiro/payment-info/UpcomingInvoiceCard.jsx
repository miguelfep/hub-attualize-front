import { toast } from 'sonner';
import { m } from 'framer-motion';
import { formatDate } from 'date-fns';
import { useMemo, useCallback } from 'react';

import Box from '@mui/material/Box';
import { Grid } from '@mui/material';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { useStatusProps } from 'src/hooks/use-status-cobranca';

import axios from 'src/utils/axios';
import { fCurrency } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';

  const handleDownloadBoleto = async (codigoSolicitacao) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}contratos/cobrancas/faturas/${codigoSolicitacao}/pdf`
      );
      const { pdf } = response.data;
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${pdf}`;
      link.download = `boleto_${codigoSolicitacao}.pdf`;
      link.click();
      toast.success('Download do boleto concluído!');
    } catch (error) {
      toast.error('Erro ao baixar o boleto.');
    }
  };
  
const InvoiceActions = ({ boleto }) => {
  const copyToClipboard = useCallback(async (text, successMsg) => {
    if (!text?.trim()) return toast.error('PIX não disponível para esta fatura.');
    try {
      await navigator.clipboard.writeText(text);
      return toast.success(successMsg);
    } catch {
      return toast.error('Erro ao copiar. Tente novamente.');
    }
  }, []);

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: 2 }}>
      <Button
        fullWidth
        variant="contained"
        color="success"
        startIcon={<Iconify icon="mdi:qrcode" />}
        onClick={() => copyToClipboard(boleto?.pixCopiaECola || '', 'PIX copiado para pagamento!')}
      >
        Pagar com PIX
      </Button>
      <Button
        fullWidth
        variant="outlined"
        color="inherit"
        startIcon={<Iconify icon="solar:printer-bold" />}
        onClick={() => {handleDownloadBoleto(boleto?.codigoSolicitacao)} }
      >
        Baixar Boleto
      </Button>
    </Stack>
  );
};

export function UpcomingInvoiceCard({ fatura }) {
  const theme = useTheme();
  const boleto = useMemo(() => (fatura?.boleto ? JSON.parse(fatura.boleto) : null), [fatura]);
  const statusProps = useStatusProps(fatura?.status);

  if (!fatura) {
    return (
      <Stack alignItems="center" spacing={1.5} sx={{ py: 6 }}>
        <Iconify
          icon="solar:calendar-check-bold-duotone"
          width={40}
          sx={{ color: 'success.main' }}
        />
        <Typography variant="h6" fontWeight={600}>
          Tudo em dia!
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Você não possui faturas em aberto para este mês.
        </Typography>
      </Stack>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card
          sx={{ border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', width: '100%' }}
        >
          <Box
            sx={{
              py: 1.5,
              px: 2,
              display: 'flex',
              alignItems: 'center',
              bgcolor: `${statusProps.color}.main`,
              color: theme.palette.getContrastText(theme.palette[statusProps.color].main),
            }}
          >
            <Iconify icon={statusProps.icon} sx={{ mr: 1.5 }} />
            <Typography
              variant="subtitle2"
              component="span"
              sx={{ textTransform: 'uppercase', fontWeight: 700 }}
            >
              {statusProps.label}
            </Typography>
          </Box>

          <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <Stack spacing={2} sx={{ p: 3 }}>
              <Typography variant="h3">{fCurrency(fatura.valor)}</Typography>

              <Stack spacing={1} sx={{ color: 'text.secondary' }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon="solar:calendar-bold" width={16} />
                  <Typography variant="body2">
                    Vencimento: {formatDate(fatura.dataVencimento, 'dd/MM/yyyy')}
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon="solar:document-text-bold" width={16} />
                  <Typography variant="body2">{fatura.observacoes}</Typography>
                </Stack>
              </Stack>

              <Divider sx={{ pt: 1 }} />
              <InvoiceActions boleto={boleto} />
            </Stack>
          </m.div>
        </Card>
      </Grid>
    </Grid>
  );
}
