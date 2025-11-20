'use client';

import {
  Container,
  Stack,
  Card,
  Typography,
  Button,
  Grid,
  Box,
  LinearProgress,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useApuracoes } from 'src/actions/apuracao';
import { useGetAllClientes } from 'src/actions/clientes';

// ----------------------------------------------------------------------

export function ApuracaoDashboardAdminView() {
  const router = useRouter();

  // Buscar dados reais
  const { data: clientes, isLoading: loadingClientes } = useGetAllClientes({
    status: true,
    apurarHub: true,
  });

  // Buscar todas as apurações
  const { data: apuracoesData, isLoading: loadingApuracoes } = useApuracoes(null, {});
  const apuracoes = apuracoesData?.apuracoes || [];

  // Calcular métricas reais
  const agora = new Date();
  const mesAtual = agora.getMonth() + 1;
  const anoAtual = agora.getFullYear();

  const apuracoesMesAtual = apuracoes.filter((ap) => {
    if (!ap.periodoApuracao) return false;
    const ano = parseInt(ap.periodoApuracao.substring(0, 4), 10);
    const mes = parseInt(ap.periodoApuracao.substring(4, 6), 10);
    return ano === anoAtual && mes === mesAtual;
  });

  const apuracoesSemDas = apuracoes.filter((ap) => !ap.dasGerado && ap.status !== 'cancelada');
  const dasGerados = apuracoes.filter((ap) => ap.dasGerado).length;

  const valorTotal = apuracoes.reduce((total, ap) => {
    return total + (ap.totalImpostos || 0);
  }, 0);

  const isLoading = loadingClientes || loadingApuracoes;

  // Calcular clientes com pendência (clientes com apuração habilitada mas sem DAS gerado)
  const clientesComPendencia = clientes?.filter((cliente) => {
    const clienteId = cliente._id || cliente.id;
    return apuracoesSemDas.some(
      (ap) => (ap.clienteId || ap.cliente?._id || ap.cliente?.id) === clienteId
    );
  }).length || 0;

  const cards = [
    {
      title: 'Clientes com Pendência',
      value: clientesComPendencia,
      icon: 'solar:users-group-rounded-bold-duotone',
      color: 'warning',
      description: 'Precisam de apuração',
      action: () => router.push(paths.dashboard.fiscal.apuracaoList),
    },
    {
      title: 'Apurações este Mês',
      value: apuracoesMesAtual.length,
      icon: 'solar:document-text-bold-duotone',
      color: 'primary',
      description: 'Calculadas no período',
      action: () => router.push(paths.dashboard.fiscal.apuracaoList),
    },
    {
      title: 'DAS Gerados',
      value: dasGerados,
      icon: 'solar:bill-list-bold-duotone',
      color: 'success',
      description: 'Documentos emitidos',
      action: () => router.push(paths.dashboard.fiscal.apuracaoList),
    },
    {
      title: 'Valor Total',
      value: `R$ ${valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: 'solar:dollar-bold-duotone',
      color: 'info',
      description: 'Em impostos calculados',
    },
  ];

  return (
    <Container maxWidth="xl">
      <CustomBreadcrumbs
        heading="Apuração de Impostos"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Fiscal', href: paths.dashboard.fiscal.root },
          { name: 'Apuração' },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="solar:users-group-rounded-bold-duotone" />}
            onClick={() => router.push(paths.dashboard.fiscal.apuracaoClientes)}
          >
            Gerenciar por Cliente
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {isLoading && <LinearProgress sx={{ mb: 3 }} />}

      <Stack spacing={3}>

        {/* Cards de Métricas */}
        <Grid container spacing={3}>
          {cards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  p: 3,
                  cursor: card.action ? 'pointer' : 'default',
                  '&:hover': card.action
                    ? {
                        bgcolor: 'action.hover',
                      }
                    : {},
                  transition: 'all 0.2s',
                }}
                onClick={card.action}
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
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {card.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {card.description}
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Ações Rápidas */}
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Ações Rápidas
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<Iconify icon="solar:users-group-rounded-bold-duotone" />}
                onClick={() => router.push(paths.dashboard.fiscal.apuracaoClientes)}
              >
                Gerenciar por Cliente
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="outlined"
                size="large"
                startIcon={<Iconify icon="solar:list-bold-duotone" />}
                onClick={() => router.push(paths.dashboard.fiscal.apuracaoList)}
              >
                Ver Todas Apurações
              </Button>
            </Grid>
          </Grid>
        </Card>
      </Stack>
    </Container>
  );
}

