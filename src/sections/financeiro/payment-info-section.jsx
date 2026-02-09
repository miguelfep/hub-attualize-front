import { useTheme } from '@emotion/react';
import { useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { CardContent } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { formatToCurrency } from 'src/components/animate';

import { InvoiceHistory } from './payment-info/InvoiceHistory';
import { UpcomingInvoiceCard } from './payment-info/UpcomingInvoiceCard';

// ----------------------------------------------------------------------

function getContractSummary(contratoItem) {
  if (!contratoItem?.faturas) return { upcoming: null, historic: [], total: 0 };

  const sorted = [...contratoItem.faturas].sort(
    (a, b) => new Date(a.dataVencimento) - new Date(b.dataVencimento)
  );

  const upcoming = sorted.find(f => !['PAGO', 'RECEBIDO', 'CANCELADO'].includes(f.status));
  const historic = sorted.filter(f => f._id !== upcoming?._id);

  return { upcoming, historic, total: sorted.length };
}

// ----------------------------------------------------------------------

function ContractCard({ contratoItem, isSelected, onClick }) {
  const { upcoming, total } = useMemo(() => getContractSummary(contratoItem), [contratoItem]);
  const title = contratoItem.contrato?.titulo || contratoItem.contrato?.cliente?.razaoSocial || 'Contrato';

  return (
    <Card
      onClick={onClick}
      sx={{
        p: 2.5,
        cursor: 'pointer',
        transition: 'all 0.3s',
        border: (t) => `2px solid ${isSelected ? t.palette.primary.main : alpha(t.palette.divider, 0.12)}`,
        bgcolor: isSelected ? (t) => alpha(t.palette.primary.main, 0.08) : 'background.paper',
        '&:hover': {
          borderColor: (t) => isSelected ? t.palette.primary.main : alpha(t.palette.primary.main, 0.5),
          transform: 'translateY(-2px)',
          boxShadow: (t) => `0 4px 20px ${alpha(t.palette.primary.main, 0.15)}`,
        },
      }}
    >
      <Stack spacing={2} direction="row" alignItems="center">
        <Box
          sx={{
            width: 48, height: 48, borderRadius: '12px', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: (t) => alpha(t.palette.primary.main, isSelected ? 0.2 : 0.1),
          }}
        >
          <Iconify icon="solar:document-text-bold-duotone" width={24} sx={{ color: isSelected ? 'primary.main' : 'text.secondary' }} />
        </Box>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="subtitle1" noWrap sx={{ fontWeight: 600, color: isSelected ? 'primary.main' : 'text.primary', mb: 0.5 }}>
            {title}
          </Typography>

          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Iconify icon="solar:bill-list-bold-duotone" width={14} sx={{ color: 'text.disabled' }} />
              <Typography variant="caption" color="text.secondary">
                {total} {total === 1 ? 'fatura' : 'faturas'}
              </Typography>
            </Stack>

            {upcoming && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Iconify icon="solar:clock-circle-bold" width={14} sx={{ color: 'warning.main' }} />
                <Typography variant="caption" sx={{ color: 'warning.main', fontWeight: 600 }}>
                  Pendente: {formatToCurrency(upcoming.valor)}
                </Typography>
              </Stack>
            )}
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
}

// ----------------------------------------------------------------------

function ContractTabPanel({ contracts, loading, tabId }) {
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    setSelectedId(null);
  }, [tabId]);

  const activeContractItem = selectedId
    ? contracts.find(c => c.contrato?._id === selectedId)
    : contracts[0];

  const { upcoming, historic } = useMemo(
    () => getContractSummary(activeContractItem || null),
    [activeContractItem]
  );

  if (loading) {
    return (
      <Stack spacing={3}>
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
          {[1, 2, 3].map((i) => <Skeleton key={i} variant="rounded" height={100} />)}
        </Box>
        <Skeleton variant="rounded" height={200} />
      </Stack>
    );
  }

  if (!contracts.length) {
    return (
      <Stack alignItems="center" spacing={1} sx={{ py: 5, fontStyle: 'italic' }}>
        <Iconify icon="solar:bill-list-bold-duotone" width={32} sx={{ color: 'text.disabled' }} />
        <Typography variant="body2" color="text.secondary">Nenhuma cobrança encontrada.</Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      {contracts.length > 1 && (
        <Box>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
            Selecione um contrato para ver os detalhes:
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)',
              },
            }}
          >
            {contracts.map((item) => (
              <ContractCard
                key={item.contrato._id}
                contratoItem={item}
                isSelected={activeContractItem?.contrato?._id === item.contrato._id}
                onClick={() => setSelectedId(item.contrato._id)}
              />
            ))}
          </Box>
        </Box>
      )}

      <Stack spacing={3}>
        <UpcomingInvoiceCard fatura={upcoming} />
        <InvoiceHistory faturas={historic} />
      </Stack>
    </Stack>
  );
}

// ----------------------------------------------------------------------

export function PaymentInfoSection({ contratos = [], loading = false }) {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  const tabs = useMemo(() => {
    const definitions = [
      {
        id: 'normal',
        label: 'Contabilidade',
        icon: 'solar:buildings-2-bold-duotone',
        data: contratos.filter(c => c.contrato?.tipoContrato !== 'parceiroid')
      },
      {
        id: 'parceiroid',
        label: 'ParceiroID',
        img: '/logo/pid-logo.webp',
        data: contratos.filter(c => c.contrato?.tipoContrato === 'parceiroid')
      },
    ];
    return definitions.filter(t => t.data.length > 0);
  }, [contratos]);

  const isEmpty = contratos.length === 0 && !loading;

  return (
    <Card>
      <CardContent
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          pb: tabs.length > 1 ? { xs: 1 } : undefined,
          borderRadius: '16px 16px 0 0',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
          Financeiro
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          {isEmpty ? 'Nenhuma cobrança encontrada' : 'Confira aqui suas faturas e contratos'}
        </Typography>

        {tabs.length > 1 && (
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{ mt: 2, '& .MuiTab-root': { minHeight: 48, fontWeight: 600 } }}
          >
            {tabs.map((tab) => (
              <Tab
                key={tab.id}
                label={tab.label}
                iconPosition="start"
                icon={
                  tab.img ? (
                    <Box component="img" src={tab.img} sx={{ width: 20, height: 20, borderRadius: '4px' }} />
                  ) : (
                    <Iconify icon={tab.icon} width={20} />
                  )
                }
              />
            ))}
          </Tabs>
        )}
      </CardContent>

      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        {isEmpty ? (
          <Stack alignItems="center" spacing={1} sx={{ py: 5 }}>
            <Iconify icon="solar:bill-list-bold-duotone" width={32} sx={{ color: 'text.disabled' }} />
            <Typography variant="body2" color="text.secondary">Nenhuma cobrança encontrada.</Typography>
          </Stack>
        ) : (
          tabs[activeTab] && (
            <ContractTabPanel
              contracts={tabs[activeTab].data}
              loading={loading}
              tabId={tabs[activeTab].id}
            />
          )
        )}
      </Box>
    </Card>
  );
}