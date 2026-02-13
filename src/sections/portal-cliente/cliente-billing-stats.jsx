import { useState, useEffect } from 'react';

import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';

import axios from 'src/utils/axios';

import { Iconify } from 'src/components/iconify';
import { formatToCurrency } from 'src/components/animate';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export function ClienteBillingStats({ anoSelecionado, filtroStatus }) {
  const { user } = useAuthContext();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}cliente-portal/dashboard/${  user.userId}`);
        setDashboardData(response.data.data);
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.userId) {
      fetchDashboardData();
    }
  }, [user?.userId]);

  // Função para filtrar cobranças por ano e status
  const getCobrancasFiltradas = () => {
    if (!dashboardData?.cobrancas) return [];
    
    return dashboardData.cobrancas.filter((cobranca) => {
      const dataVencimento = new Date(cobranca.dataVencimento);
      const anoVencimento = dataVencimento.getFullYear();
      
      const statusMatch = filtroStatus === 'TODOS' || cobranca.status === filtroStatus;
      
      return anoVencimento === anoSelecionado && statusMatch;
    });
  };

  // Função para calcular estatísticas
  const getEstatisticas = () => {
    const cobrancasFiltradas = getCobrancasFiltradas();
    
    const total = cobrancasFiltradas.reduce((sum, cobranca) => sum + (cobranca.valor || 0), 0);
    const pagas = cobrancasFiltradas.filter(c => c.status === 'RECEBIDO').reduce((sum, cobranca) => sum + (cobranca.valor || 0), 0);
    const pendentes = cobrancasFiltradas.filter(c => c.status === 'EMABERTO').reduce((sum, cobranca) => sum + (cobranca.valor || 0), 0);
    const canceladas = cobrancasFiltradas.filter(c => c.status === 'CANCELADO').reduce((sum, cobranca) => sum + (cobranca.valor || 0), 0);
    
    return { 
      total, 
      pagas, 
      pendentes, 
      canceladas, 
      totalCobrancas: cobrancasFiltradas.length,
      percentualPago: total > 0 ? (pagas / total) * 100 : 0
    };
  };

  if (loading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map((item) => (
          <Grid key={item} item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Carregando...
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  const estatisticas = getEstatisticas();

  return (
    <Stack spacing={3}>
      {/* Cards de Estatísticas */}
      <Grid container spacing={3}>
        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                  <Iconify icon="solar:bill-list-bold-duotone" width={24} />
                </Avatar>
                <Stack>
                  <Typography variant="h4" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
                    {estatisticas.totalCobrancas}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Total de Cobranças ({anoSelecionado})
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'success.main', width: 48, height: 48 }}>
                  <Iconify icon="solar:check-circle-bold-duotone" width={24} />
                </Avatar>
                <Stack>
                  <Typography variant="h4" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
                    {formatToCurrency(estatisticas.pagas)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Total Pago
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'warning.main', width: 48, height: 48 }}>
                  <Iconify icon="solar:clock-circle-bold-duotone" width={24} />
                </Avatar>
                <Stack>
                  <Typography variant="h4" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
                    {formatToCurrency(estatisticas.pendentes)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Pendente
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'error.main', width: 48, height: 48 }}>
                  <Iconify icon="solar:close-circle-bold-duotone" width={24} />
                </Avatar>
                <Stack>
                  <Typography variant="h4" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
                    {formatToCurrency(estatisticas.canceladas)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Cancelado
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Progresso de Pagamentos */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" sx={{ color: 'text.primary' }}>
                Progresso de Pagamentos - {anoSelecionado}
              </Typography>
              <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
                {Math.round(estatisticas.percentualPago)}%
              </Typography>
            </Stack>
            <LinearProgress 
              variant="determinate" 
              value={estatisticas.percentualPago}
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Pago: {formatToCurrency(estatisticas.pagas)}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Total: {formatToCurrency(estatisticas.total)}
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
