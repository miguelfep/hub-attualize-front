import { useTheme } from '@emotion/react';
import { useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, CardContent } from '@mui/material';

import { Iconify } from 'src/components/iconify';

import { InvoiceHistory } from './payment-info/InvoiceHistory';
import { UpcomingInvoiceCard } from './payment-info/UpcomingInvoiceCard';

export function PaymentInfoSection({ contratos = [] }) {
  const theme = useTheme();
  const [selectedContractId, setSelectedContractId] = useState(null);

  useEffect(() => {
    if (contratos.length > 0 && !selectedContractId) {
      setSelectedContractId(contratos[0].contrato._id);
    }
  }, [contratos, selectedContractId]);

  const processedData = useMemo(() => {
    if (!selectedContractId) {
      return { upcomingInvoice: null, historicInvoices: [] };
    }

    const selected = contratos.find((c) => c.contrato._id === selectedContractId);
    if (!selected) {
      return { upcomingInvoice: null, historicInvoices: [] };
    }

    // Ordena faturas da mais antiga para a mais recente
    const sortedFaturas = [...selected.faturas].sort(
      (a, b) => new Date(a.dataVencimento) - new Date(b.dataVencimento)
    );

    // AJUSTE: A fatura "próxima" é a primeira que não estiver paga ou cancelada.
    const upcomingInvoice =
      sortedFaturas.find(
        (fatura) => !['PAGO', 'RECEBIDO', 'CANCELADO'].includes(fatura.status)
      ) || null;

    // AJUSTE: O histórico contém todas as outras faturas.
    const historicInvoices = sortedFaturas.filter((fatura) => fatura._id !== upcomingInvoice?._id);

    return { upcomingInvoice, historicInvoices };
  }, [selectedContractId, contratos]);

  if (contratos.length === 0) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent
          sx={{
            p: 4,
            bgcolor: 'background.neutral',
            borderRadius: '16px 16px 0 0',
            background: `linear-gradient(135deg, ${alpha(
              theme.palette.primary.main,
              0.1
            )}, ${alpha(theme.palette.secondary.main, 0.1)})`,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Financeiro
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Nenhuma cobrança encontrada
            </Typography>
          </Box>
        </CardContent>

        <Box>
          <Stack alignItems="center" spacing={1} sx={{ py: 5 }}>
            <Iconify
              icon="solar:bill-list-bold-duotone"
              width={32}
              sx={{ color: 'text.disabled' }}
            />
            <Typography variant="body2" color="text.secondary">
              Nenhuma cobrança encontrada.
            </Typography>
          </Stack>
        </Box>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent
        sx={{
          p: 4,
          bgcolor: 'background.neutral',
          borderRadius: '16px 16px 0 0',
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.primary.main,
            0.1
          )}, ${alpha(theme.palette.secondary.main, 0.1)})`,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Financeiro
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Confira aqui suas faturas e contratos
          </Typography>
        </Box>
      </CardContent>

      <Box sx={{ p: 3 }}>
        <Stack spacing={3}>
          <UpcomingInvoiceCard fatura={processedData.upcomingInvoice} />
          <InvoiceHistory faturas={processedData.historicInvoices} />
        </Stack>
      </Box>
    </Card>
  );
}
