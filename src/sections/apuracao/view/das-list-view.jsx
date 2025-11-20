'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

import {
  Container,
  Stack,
  Card,
  Typography,
  Alert,
  AlertTitle,
  LinearProgress,
  Box,
  Tabs,
  Tab,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useAuthContext } from 'src/auth/hooks';
import { useEmpresa } from 'src/hooks/use-empresa';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useDas, baixarDasPdf } from 'src/actions/apuracao';

import { DasCard } from '../das-card';

// ----------------------------------------------------------------------

export function DasListView() {
  const router = useRouter();
  const { user } = useAuthContext();
  const userId = user?.id || user?._id || user?.userId;

  const { empresaAtiva } = useEmpresa(userId);

  const [currentTab, setCurrentTab] = useState('gerado');

  // Buscar DAS
  const { data: dasData, isLoading, mutate } = useDas(empresaAtiva, {
    status: currentTab !== 'all' ? currentTab : undefined,
  });

  const handleDownloadDas = useCallback(async (dasId, numeroDocumento, periodo) => {
    try {
      toast.info('Gerando PDF...');
      const response = await baixarDasPdf(dasId);

      // Criar blob e fazer download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `DAS_${numeroDocumento}_${periodo}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast.success('PDF baixado com sucesso!');
    } catch (error) {
      toast.error(error.message || 'Erro ao baixar PDF do DAS');
    }
  }, []);

  const handleViewDas = useCallback(
    (dasId) => {
      router.push(paths.cliente.apuracao.dasDetalhes(dasId));
    },
    [router]
  );

  const tabs = [
    {
      value: 'gerado',
      label: 'Pendentes',
      icon: <Iconify icon="solar:clock-circle-bold-duotone" width={20} />,
      count: dasData?.das?.filter((d) => d.status === 'gerado').length || 0,
    },
    {
      value: 'pago',
      label: 'Pagos',
      icon: <Iconify icon="solar:check-circle-bold-duotone" width={20} />,
      count: dasData?.das?.filter((d) => d.status === 'pago').length || 0,
    },
    {
      value: 'all',
      label: 'Todos',
      icon: <Iconify icon="solar:list-bold-duotone" width={20} />,
      count: dasData?.total || 0,
    },
  ];

  const filteredDas =
    currentTab === 'all'
      ? dasData?.das || []
      : dasData?.das?.filter((d) => d.status === currentTab) || [];

  if (!empresaAtiva) {
    return (
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Alert severity="warning">
          <AlertTitle>Empresa não selecionada</AlertTitle>
          Selecione uma empresa para visualizar os DAS.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <CustomBreadcrumbs
        heading="DAS - Documento de Arrecadação"
        links={[
          { name: 'Portal', href: paths.cliente.root },
          { name: 'Apuração', href: paths.cliente.apuracao.root },
          { name: 'DAS' },
        ]}
        sx={{ mb: 3 }}
      />

      {isLoading && <LinearProgress sx={{ mb: 3 }} />}

      <Stack spacing={3}>
        {/* Informações */}
        <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold-duotone" />}>
          <AlertTitle>Sobre o DAS</AlertTitle>
          O DAS (Documento de Arrecadação do Simples Nacional) é o documento usado para recolher
          os impostos calculados na apuração mensal. Certifique-se de pagar dentro do prazo para
          evitar juros e multas.
        </Alert>

        {/* Tabs de Filtro */}
        <Card>
          <Tabs
            value={currentTab}
            onChange={(_, newValue) => setCurrentTab(newValue)}
            sx={{
              px: 2,
              borderBottom: (theme) => `solid 1px ${theme.palette.divider}`,
            }}
          >
            {tabs.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                label={tab.label}
                icon={tab.icon}
                iconPosition="start"
                sx={{
                  '&:not(:last-of-type)': {
                    mr: 3,
                  },
                }}
              />
            ))}
          </Tabs>

          <Box sx={{ p: 3 }}>
            {filteredDas.length === 0 && !isLoading && (
              <Box sx={{ py: 5, textAlign: 'center' }}>
                <Iconify
                  icon="solar:bill-list-bold-duotone"
                  width={80}
                  sx={{ color: 'text.disabled', mb: 2 }}
                />
                <Typography variant="h6" color="text.secondary">
                  Nenhum DAS encontrado
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {currentTab === 'gerado'
                    ? 'Não há DAS pendentes de pagamento'
                    : 'Nenhum DAS foi gerado ainda'}
                </Typography>
              </Box>
            )}

            <Stack spacing={2}>
              {filteredDas.map((das) => (
                <DasCard
                  key={das._id}
                  das={das}
                  onView={() => handleViewDas(das._id)}
                  onDownload={() =>
                    handleDownloadDas(das._id, das.numeroDocumento, das.periodoApuracao)
                  }
                />
              ))}
            </Stack>
          </Box>
        </Card>
      </Stack>
    </Container>
  );
}

