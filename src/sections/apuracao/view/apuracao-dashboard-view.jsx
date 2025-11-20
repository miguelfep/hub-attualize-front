'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

import {
  Box,
  Card,
  Container,
  Stack,
  Typography,
  Button,
  Grid,
  Alert,
  AlertTitle,
  Chip,
  LinearProgress,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useAuthContext } from 'src/auth/hooks';
import { useEmpresa } from 'src/hooks/use-empresa';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useApuracoes, useDas } from 'src/actions/apuracao';
import { useHistorico12Meses } from 'src/actions/historico-folha';
import { formatarPeriodo, FATOR_R_MINIMO } from 'src/types/apuracao';

import { ApuracaoCard } from '../apuracao-card';
import { HistoricoChart } from '../historico-chart';
import { DasCard } from '../das-card';

// ----------------------------------------------------------------------

export function ApuracaoDashboardView() {
  const router = useRouter();
  const { user } = useAuthContext();
  const userId = user?.id || user?._id || user?.userId;

  const { empresaAtiva, loadingEmpresas } = useEmpresa(userId);
  
  // Período atual (mês anterior)
  const now = new Date();
  const mesAnterior = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const periodoAtual = `${mesAnterior.getFullYear()}${String(mesAnterior.getMonth() + 1).padStart(2, '0')}`;

  // Buscar histórico dos últimos 12 meses
  const { data: historico12Meses, isLoading: loadingHistorico } = useHistorico12Meses(
    empresaAtiva,
    periodoAtual
  );

  // Buscar apurações recentes
  const { data: apuracoesData, isLoading: loadingApuracoes } = useApuracoes(empresaAtiva, {
    periodoFim: periodoAtual,
  });

  // Buscar DAS gerados
  const { data: dasData, isLoading: loadingDas } = useDas(empresaAtiva);

  const isLoading = loadingEmpresas || loadingHistorico || loadingApuracoes || loadingDas;

  const handleCalcularApuracao = useCallback(() => {
    router.push(paths.cliente.apuracao.calcular);
  }, [router]);

  const handleGerenciarHistorico = useCallback(() => {
    router.push(paths.cliente.apuracao.historico);
  }, [router]);

  const handleVerDas = useCallback(() => {
    router.push(paths.cliente.apuracao.das);
  }, [router]);

  // Cards de resumo
  const resumoCards = [
    {
      icon: 'solar:document-text-bold-duotone',
      title: 'Apurações',
      value: apuracoesData?.total || 0,
      color: 'primary',
      onClick: () => {/* Ver lista de apurações */},
    },
    {
      icon: 'solar:bill-list-bold-duotone',
      title: 'DAS Gerados',
      value: dasData?.das?.filter(d => d.status === 'gerado').length || 0,
      color: 'info',
      onClick: handleVerDas,
    },
    {
      icon: 'solar:dollar-bold-duotone',
      title: 'Total a Pagar',
      value: `R$ ${(dasData?.das?.filter(d => d.status === 'gerado')
        .reduce((sum, d) => sum + d.valores.total, 0) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      color: 'warning',
      onClick: handleVerDas,
    },
    {
      icon: 'solar:chart-bold-duotone',
      title: 'Fator R Médio',
      value: historico12Meses?.totais?.fatorRMedio
        ? `${historico12Meses.totais.fatorRMedio.toFixed(2)}%`
        : '-',
      color: historico12Meses?.totais?.atingeFatorRMinimo ? 'success' : 'error',
    },
  ];

  if (!empresaAtiva) {
    return (
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Alert severity="warning">
          <AlertTitle>Empresa não selecionada</AlertTitle>
          Selecione uma empresa para visualizar as informações de apuração.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <CustomBreadcrumbs
        heading="Apuração de Impostos"
        links={[
          { name: 'Portal', href: paths.cliente.root },
          { name: 'Apuração' },
        ]}
        action={
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="solar:history-bold-duotone" />}
              onClick={handleGerenciarHistorico}
            >
              Histórico
            </Button>
            <Button
              variant="contained"
              startIcon={<Iconify icon="solar:calculator-bold-duotone" />}
              onClick={handleCalcularApuracao}
            >
              Calcular Apuração
            </Button>
          </Stack>
        }
        sx={{ mb: 3 }}
      />

      {isLoading && <LinearProgress sx={{ mb: 3 }} />}

      <Stack spacing={3}>
        {/* Cards de Resumo */}
        <Grid container spacing={3}>
          {resumoCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  p: 3,
                  cursor: card.onClick ? 'pointer' : 'default',
                  '&:hover': card.onClick
                    ? {
                        bgcolor: 'action.hover',
                      }
                    : {},
                }}
                onClick={card.onClick}
              >
                <Stack spacing={2}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: `${card.color}.lighter`,
                      color: `${card.color}.main`,
                    }}
                  >
                    <Iconify icon={card.icon} width={32} />
                  </Box>
                  <Box>
                    <Typography variant="h3">{card.value}</Typography>
              <Typography variant="body2" color="text.secondary">
                      {card.title}
              </Typography>
                  </Box>
            </Stack>
        </Card>
            </Grid>
          ))}
        </Grid>

        {/* Status do Fator R */}
        {historico12Meses && (
          <Card sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="h6">Status do Fator R</Typography>
                        <Chip
                  label={
                    historico12Meses.totais.atingeFatorRMinimo
                      ? `Anexo III (≥${FATOR_R_MINIMO}%)`
                      : `Anexo V (<${FATOR_R_MINIMO}%)`
                  }
                  color={historico12Meses.totais.atingeFatorRMinimo ? 'success' : 'warning'}
                />
      </Stack>

              <Alert
                severity={historico12Meses.totais.atingeFatorRMinimo ? 'success' : 'info'}
                icon={
                  <Iconify
                    icon={
                      historico12Meses.totais.atingeFatorRMinimo
                        ? 'solar:check-circle-bold-duotone'
                        : 'solar:info-circle-bold-duotone'
                    }
                  />
                }
              >
                <AlertTitle>
                  Fator R: {historico12Meses.totais.fatorRMedio.toFixed(2)}%
                </AlertTitle>
                {historico12Meses.totais.atingeFatorRMinimo ? (
                  <>
                    Sua empresa atinge o fator R mínimo de {FATOR_R_MINIMO}%. Você se enquadra no{' '}
                    <strong>Anexo III</strong> com alíquotas reduzidas.
                  </>
                ) : (
                  <>
                    Seu fator R está abaixo de {FATOR_R_MINIMO}%. Sua empresa está enquadrada no{' '}
                    <strong>Anexo V</strong>.
                  </>
                )}
              </Alert>

        <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
            <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      Folha + INSS (12 meses)
              </Typography>
                    <Typography variant="h6">
                      R${' '}
                      {historico12Meses.totais.folhaComEncargosTotal.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}
              </Typography>
            </Stack>
          </Grid>
                <Grid item xs={12} md={4}>
                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      Faturamento (12 meses)
                </Typography>
                    <Typography variant="h6">
                      R${' '}
                      {historico12Meses.totais.faturamentoTotal.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}
                </Typography>
            </Stack>
                </Grid>
                <Grid item xs={12} md={4}>
        <Stack spacing={1}>
          <Typography variant="body2" color="text.secondary">
                      Meses Registrados
          </Typography>
                    <Typography variant="h6">{historico12Meses.mesesEncontrados} / 12</Typography>
          </Stack>
                </Grid>
              </Grid>
        </Stack>
    </Card>
        )}

        {/* Gráfico de Evolução */}
        {historico12Meses && historico12Meses.historicos?.length > 0 && (
          <HistoricoChart historicos={historico12Meses.historicos} />
        )}

        {/* Apurações Recentes */}
        {apuracoesData && apuracoesData.apuracoes && apuracoesData.apuracoes.length > 0 && (
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Apurações Recentes
          </Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
              {apuracoesData.apuracoes.slice(0, 5).map((apuracao) => (
                <ApuracaoCard
                  key={apuracao._id}
                  apuracao={apuracao}
                  onView={() => router.push(paths.cliente.apuracao.detalhes(apuracao._id))}
                      />
              ))}
                    </Stack>
              </Card>
        )}

        {/* DAS Pendentes */}
        {dasData && dasData.das && dasData.das.filter(d => d.status === 'gerado').length > 0 && (
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              DAS Pendentes de Pagamento
                </Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
              {dasData.das
                .filter(d => d.status === 'gerado')
                .slice(0, 5)
                .map((das) => (
                  <DasCard
                    key={das._id}
                    das={das}
                    onView={() => router.push(paths.cliente.apuracao.dasDetalhes(das._id))}
                  />
                ))}
            </Stack>
            </Card>
          )}

        {/* Ações rápidas */}
        {!historico12Meses?.totais && !loadingHistorico && (
          <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold-duotone" />}>
            <AlertTitle>Primeiro Acesso</AlertTitle>
            Para começar a usar o sistema de apuração, primeiro você precisa cadastrar o histórico
            de folha e faturamento dos últimos 12 meses.
            <Button
              variant="outlined"
            size="small"
              startIcon={<Iconify icon="solar:upload-bold-duotone" />}
              onClick={handleGerenciarHistorico}
              sx={{ mt: 2 }}
            >
              Cadastrar Histórico
        </Button>
          </Alert>
        )}
    </Stack>
    </Container>
  );
}
