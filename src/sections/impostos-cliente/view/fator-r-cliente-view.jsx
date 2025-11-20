'use client';

import dynamic from 'next/dynamic';

import {
  Container,
  Stack,
  Card,
  Typography,
  Alert,
  AlertTitle,
  LinearProgress,
  Box,
  Grid,
  Chip,
  Button,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useAuthContext } from 'src/auth/hooks';
import { useEmpresa } from 'src/hooks/use-empresa';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useHistorico12Meses } from 'src/actions/historico-folha';
import { FATOR_R_MINIMO } from 'src/utils/apuracao-helpers';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

// ----------------------------------------------------------------------

export function FatorRClienteView() {
  const router = useRouter();
  const { user } = useAuthContext();
  const userId = user?.id || user?._id || user?.userId;

  const { empresaAtiva } = useEmpresa(userId);

  // Período atual (mês anterior)
  const now = new Date();
  const mesAnterior = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const periodoAtual = `${mesAnterior.getFullYear()}${String(mesAnterior.getMonth() + 1).padStart(2, '0')}`;

  // Buscar histórico dos últimos 12 meses
  const { data: historico12Meses, isLoading } = useHistorico12Meses(empresaAtiva, periodoAtual);

  // Dados para o gráfico
  const historicosSorted = historico12Meses?.historicos
    ? [...historico12Meses.historicos].sort(
        (a, b) => parseInt(a.periodoApuracao, 10) - parseInt(b.periodoApuracao, 10)
      )
    : [];

  const chartSeries = [
    {
      name: 'Fator R (%)',
      data: historicosSorted.map((h) => parseFloat(h.fatorRPercentual.toFixed(2))),
    },
  ];

  const chartOptions = {
    chart: {
      type: 'line',
      toolbar: { show: true },
      zoom: { enabled: true },
    },
    stroke: {
      width: 3,
      curve: 'smooth',
    },
    xaxis: {
      categories: historicosSorted.map(
        (h) => `${h.periodoApuracao.substring(4, 6)}/${h.periodoApuracao.substring(0, 4)}`
      ),
      labels: {
        rotate: -45,
        rotateAlways: true,
      },
    },
    yaxis: {
      title: {
        text: 'Fator R (%)',
      },
      min: 0,
      max: Math.max(...historicosSorted.map((h) => h.fatorRPercentual), FATOR_R_MINIMO) + 5,
      labels: {
        formatter: (value) => `${value.toFixed(1)}%`,
      },
    },
    tooltip: {
      y: {
        formatter: (value) => `${value.toFixed(2)}%`,
      },
    },
    colors: ['#00AB55'],
    annotations: {
      yaxis: [
        {
          y: FATOR_R_MINIMO,
          borderColor: '#FF5630',
          strokeDashArray: 4,
          label: {
            borderColor: '#FF5630',
            style: {
              color: '#fff',
              background: '#FF5630',
            },
            text: `Mínimo: ${FATOR_R_MINIMO}%`,
          },
        },
      ],
    },
    markers: {
      size: 5,
      hover: {
        size: 7,
      },
    },
  };

  if (!empresaAtiva) {
    return (
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Alert severity="warning">
          <AlertTitle>Empresa não selecionada</AlertTitle>
          Selecione uma empresa para visualizar o Fator R.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <CustomBreadcrumbs
        heading="Acompanhamento do Fator R"
        links={[
          { name: 'Portal', href: paths.cliente.root },
          { name: 'Impostos', href: paths.cliente.impostos.root },
          { name: 'Fator R' },
        ]}
        action={
          <Button
            variant="outlined"
            startIcon={<Iconify icon="solar:arrow-left-linear" />}
            onClick={() => router.push(paths.cliente.impostos.root)}
          >
            Voltar para Impostos
          </Button>
        }
        sx={{ mb: 3 }}
      />

      {isLoading && <LinearProgress sx={{ mb: 3 }}/>}

      <Stack spacing={3}>
        {/* O que é Fator R */}
        <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold-duotone" />}>
          <AlertTitle>O que é o Fator R?</AlertTitle>
          O Fator R é um indicador que determina se sua empresa se enquadra no Anexo III (alíquotas
          menores) ou Anexo V (alíquotas padrão) do Simples Nacional. É calculado pela razão entre a
          folha de pagamento + encargos e a receita bruta dos últimos 12 meses.
        </Alert>

        {/* Status Atual do Fator R */}
        {historico12Meses && (
          <Card sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="h5">Status Atual do Fator R</Typography>
                <Chip
                  label={
                    historico12Meses.totais.atingeFatorRMinimo
                      ? `Anexo III (≥${FATOR_R_MINIMO}%)`
                      : `Anexo V (<${FATOR_R_MINIMO}%)`
                  }
                  color={historico12Meses.totais.atingeFatorRMinimo ? 'success' : 'warning'}
                  size="large"
                  sx={{ px: 2, py: 3 }}
                />
              </Stack>

              <Box
                sx={{
                  p: 3,
                  borderRadius: 2,
                  bgcolor: historico12Meses.totais.atingeFatorRMinimo
                    ? 'success.lighter'
                    : 'warning.lighter',
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: historico12Meses.totais.atingeFatorRMinimo
                        ? 'success.main'
                        : 'warning.main',
                      color: 'common.white',
                    }}
                  >
                    <Typography variant="h3">
                      {historico12Meses.totais.fatorRMedio.toFixed(1)}%
                    </Typography>
                  </Box>
                  <Stack flex={1}>
                    <Typography variant="h6">
                      Fator R Médio dos Últimos 12 Meses
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {historico12Meses.totais.atingeFatorRMinimo ? (
                        <>
                          🎉 Parabéns! Sua empresa atinge o fator R mínimo de {FATOR_R_MINIMO}%. Você
                          está enquadrado no <strong>Anexo III</strong> com alíquotas reduzidas.
                        </>
                      ) : (
                        <>
                          ℹ️ Seu fator R está abaixo de {FATOR_R_MINIMO}%. Sua empresa está
                          enquadrada no <strong>Anexo V</strong>.
                        </>
                      )}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Stack spacing={1}>
                      <Typography variant="caption" color="text.secondary">
                        Folha + INSS (12 meses)
                      </Typography>
                      <Typography variant="h6">
                        R${' '}
                        {historico12Meses.totais.folhaComEncargosTotal.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                        })}
                      </Typography>
                    </Stack>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Stack spacing={1}>
                      <Typography variant="caption" color="text.secondary">
                        Faturamento (12 meses)
                      </Typography>
                      <Typography variant="h6">
                        R${' '}
                        {historico12Meses.totais.faturamentoTotal.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                        })}
                      </Typography>
                    </Stack>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Stack spacing={1}>
                      <Typography variant="caption" color="text.secondary">
                        Meses Registrados
                      </Typography>
                      <Typography variant="h6">
                        {historico12Meses.mesesEncontrados} / 12
                      </Typography>
                    </Stack>
                  </Card>
                </Grid>
              </Grid>
            </Stack>
          </Card>
        )}

        {/* Gráfico de Evolução */}
        {historico12Meses && historicosSorted.length > 0 && (
          <Card>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Evolução do Fator R
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Acompanhe a evolução do seu Fator R mês a mês
              </Typography>
              <ReactApexChart
                type="line"
                series={chartSeries}
                options={chartOptions}
                height={350}
              />
            </Box>
          </Card>
        )}

        {/* Como Melhorar o Fator R */}
        <Card sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h6">Como Melhorar o Fator R?</Typography>
            <Typography variant="body2" color="text.secondary">
              Para atingir o Fator R mínimo de {FATOR_R_MINIMO}% e se beneficiar do Anexo III, você
              pode:
            </Typography>
            <Stack spacing={1.5} sx={{ pl: 2 }}>
              <Stack direction="row" spacing={1}>
                <Iconify icon="solar:check-circle-bold-duotone" width={20} color="success.main" />
                <Typography variant="body2">
                  <strong>Aumentar a folha de pagamento:</strong> Contratar mais funcionários ou
                  aumentar salários
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1}>
                <Iconify icon="solar:check-circle-bold-duotone" width={20} color="success.main" />
                <Typography variant="body2">
                  <strong>Aumentar o pró-labore:</strong> Elevar a retirada dos sócios
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1}>
                <Iconify icon="solar:check-circle-bold-duotone" width={20} color="success.main" />
                <Typography variant="body2">
                  <strong>Contratar prestadores de serviço:</strong> Como pessoa física (PJ não
                  conta)
                </Typography>
              </Stack>
            </Stack>
            <Alert severity="warning" icon={<Iconify icon="solar:danger-circle-bold-duotone" />}>
              <AlertTitle>Importante</AlertTitle>
              Consulte sempre nosso time de contadores antes de fazer alterações. Eles podem te
              orientar sobre a melhor estratégia para sua empresa.
            </Alert>
          </Stack>
        </Card>

        {/* Sem Dados */}
        {!historico12Meses?.totais && !isLoading && (
          <Alert severity="info">
            <AlertTitle>Dados Indisponíveis</AlertTitle>
            O cálculo do Fator R requer o histórico dos últimos 12 meses. Entre em contato com
            nosso time de contadores para atualizar seus dados.
          </Alert>
        )}
      </Stack>
    </Container>
  );
}

