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
  Button,
  Chip,
  Divider,
  Grid,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useAuthContext } from 'src/auth/hooks';
import { useEmpresa } from 'src/hooks/use-empresa';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useDas, baixarDasPdf } from 'src/actions/apuracao';

// ----------------------------------------------------------------------

export function ImpostosClienteView() {
  const router = useRouter();
  const { user } = useAuthContext();
  const userId = user?.id || user?._id || user?.userId;

  const { empresaAtiva } = useEmpresa(userId);

  const [currentTab, setCurrentTab] = useState('pendentes');

  // Buscar DAS
  const { data: dasData, isLoading } = useDas(empresaAtiva);

  const handleDownloadDas = useCallback(async (das) => {
    try {
      toast.info('Gerando PDF...');
      const response = await baixarDasPdf(das._id);

      // Criar blob e fazer download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `DAS_${das.numeroDocumento}_${das.periodoApuracao}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast.success('PDF baixado com sucesso!');
    } catch (error) {
      toast.error(error.message || 'Erro ao baixar PDF do DAS');
    }
  }, []);

  // Formatar data de vencimento AAAAMMDD -> DD/MM/AAAA
  const formatarDataVencimento = (data) => {
    if (!data || data.length !== 8) return data;
    const ano = data.substring(0, 4);
    const mes = data.substring(4, 6);
    const dia = data.substring(6, 8);
    return `${dia}/${mes}/${ano}`;
  };

  // Verificar se está vencido
  const isVencido = (das) => {
    if (!das.dataVencimento || das.status !== 'gerado') return false;
    const hoje = new Date();
    const vencimento = new Date(
      parseInt(das.dataVencimento.substring(0, 4), 10),
      parseInt(das.dataVencimento.substring(4, 6), 10) - 1,
      parseInt(das.dataVencimento.substring(6, 8), 10)
    );
    return vencimento < hoje;
  };

  const tabs = [
    {
      value: 'pendentes',
      label: 'Pendentes',
      count: dasData?.das?.filter((d) => d.status === 'gerado').length || 0,
    },
    {
      value: 'pagos',
      label: 'Pagos',
      count: dasData?.das?.filter((d) => d.status === 'pago').length || 0,
    },
    {
      value: 'todos',
      label: 'Todos',
      count: dasData?.total || 0,
    },
  ];

  const filteredDas =
    currentTab === 'todos'
      ? dasData?.das || []
      : dasData?.das?.filter((d) =>
          currentTab === 'pendentes' ? d.status === 'gerado' : d.status === 'pago'
        ) || [];

  if (!empresaAtiva) {
    return (
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Alert severity="warning">
          <AlertTitle>Empresa não selecionada</AlertTitle>
          Selecione uma empresa para visualizar seus impostos.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <CustomBreadcrumbs
        heading="Meus Impostos"
        links={[{ name: 'Portal', href: paths.cliente.root }, { name: 'Impostos' }]}
        action={
          <Button
            variant="outlined"
            startIcon={<Iconify icon="solar:chart-bold-duotone" />}
            onClick={() => router.push(paths.cliente.impostos.fatorR)}
          >
            Ver Fator R
          </Button>
        }
        sx={{ mb: 3 }}
      />

      {isLoading && <LinearProgress sx={{ mb: 3 }} />}

      <Stack spacing={3}>
        {/* Informações */}
        <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold-duotone" />}>
          <AlertTitle>Sobre seus Impostos</AlertTitle>
          Aqui você encontra todos os documentos de arrecadação (DAS) gerados pela nossa equipe de
          contadores. Baixe os PDFs e efetue o pagamento dentro do prazo para evitar juros e
          multas.
        </Alert>

        {/* Cards de Resumo */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'warning.lighter',
                    color: 'warning.main',
                  }}
                >
                  <Iconify icon="solar:clock-circle-bold-duotone" width={32} />
                </Box>
                <Box>
                  <Typography variant="h3">
                    {dasData?.das?.filter((d) => d.status === 'gerado').length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    DAS Pendentes
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'error.lighter',
                    color: 'error.main',
                  }}
                >
                  <Iconify icon="solar:dollar-bold-duotone" width={32} />
                </Box>
                <Box>
                  <Typography variant="h3">
                    R${' '}
                    {(
                      dasData?.das
                        ?.filter((d) => d.status === 'gerado')
                        .reduce((sum, d) => sum + d.valores.total, 0) || 0
                    ).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total a Pagar
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'success.lighter',
                    color: 'success.main',
                  }}
                >
                  <Iconify icon="solar:check-circle-bold-duotone" width={32} />
                </Box>
                <Box>
                  <Typography variant="h3">
                    {dasData?.das?.filter((d) => d.status === 'pago').length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    DAS Pagos
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs de Filtro e Lista */}
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
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {tab.label}
                    <Chip label={tab.count} size="small" />
                  </Box>
                }
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
                  {currentTab === 'pendentes'
                    ? 'Não há documentos pendentes de pagamento'
                    : currentTab === 'pagos'
                      ? 'Nenhum documento foi pago ainda'
                      : 'Nenhum documento foi gerado ainda'}
                </Typography>
              </Box>
            )}

            <Stack spacing={2}>
              {filteredDas.map((das) => {
                const vencido = isVencido(das);
                return (
                  <Card key={das._id} sx={{ p: 2.5, border: 1, borderColor: 'divider' }}>
                    <Stack spacing={2}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        flexWrap="wrap"
                        gap={2}
                      >
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: 1.5,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: vencido ? 'error.lighter' : 'warning.lighter',
                              color: vencido ? 'error.main' : 'warning.main',
                            }}
                          >
                            <Iconify
                              icon={
                                vencido
                                  ? 'solar:danger-circle-bold-duotone'
                                  : 'solar:bill-list-bold-duotone'
                              }
                              width={28}
                            />
                          </Box>
                          <Stack>
                            <Typography variant="subtitle1">
                              DAS - {das.periodoApuracao.substring(4, 6)}/
                              {das.periodoApuracao.substring(0, 4)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Documento: {das.numeroDocumento}
                            </Typography>
                          </Stack>
                        </Stack>
                        <Stack direction="row" spacing={1}>
                          <Chip
                            label={das.status === 'gerado' ? 'Pendente' : 'Pago'}
                            color={das.status === 'gerado' ? 'warning' : 'success'}
                            size="small"
                          />
                          {das.ambiente === 'teste' && (
                            <Chip label="TESTE" color="default" size="small" variant="outlined" />
                          )}
                        </Stack>
                      </Stack>

                      <Divider />

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                          <Stack>
                            <Typography variant="caption" color="text.secondary">
                              Vencimento
                            </Typography>
                            <Typography
                              variant="subtitle2"
                              color={vencido ? 'error.main' : 'text.primary'}
                            >
                              {formatarDataVencimento(das.dataVencimento)}
                            </Typography>
                          </Stack>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Stack>
                            <Typography variant="caption" color="text.secondary">
                              Valor Principal
                            </Typography>
                            <Typography variant="subtitle2">
                              R${' '}
                              {das.valores.principal.toLocaleString('pt-BR', {
                                minimumFractionDigits: 2,
                              })}
                            </Typography>
                          </Stack>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Stack>
                            <Typography variant="caption" color="text.secondary">
                              Total a Pagar
                            </Typography>
                            <Typography variant="subtitle2" color="error.main" fontWeight="bold">
                              R${' '}
                              {das.valores.total.toLocaleString('pt-BR', {
                                minimumFractionDigits: 2,
                              })}
                            </Typography>
                          </Stack>
                        </Grid>
                      </Grid>

                      {vencido && (
                        <Alert severity="error" icon={<Iconify icon="solar:danger-circle-bold-duotone" />}>
                          <AlertTitle>DAS Vencido!</AlertTitle>
                          Este documento está vencido. Podem ser acrescidos juros e multa. Entre em
                          contato com nosso time de contadores.
                        </Alert>
                      )}

                      <Button
                        variant="contained"
                        size="large"
                        fullWidth
                        startIcon={<Iconify icon="solar:download-bold-duotone" />}
                        onClick={() => handleDownloadDas(das)}
                      >
                        Baixar DAS (PDF)
                      </Button>
                    </Stack>
                  </Card>
                );
              })}
            </Stack>
          </Box>
        </Card>
      </Stack>
    </Container>
  );
}

