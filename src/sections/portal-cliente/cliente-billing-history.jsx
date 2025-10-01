import { useState, useEffect } from 'react';

import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import ListItemText from '@mui/material/ListItemText';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import axios from 'src/utils/axios';

import { Iconify } from 'src/components/iconify';
import { formatToCurrency } from 'src/components/animate';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export function ClienteBillingHistory({ anoSelecionado, filtroStatus }) {
  const { user } = useAuthContext();
  const showMore = useBoolean();
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
    }).sort((a, b) => new Date(a.dataVencimento) - new Date(b.dataVencimento));
  };

  const getStatusColor = (status) => {
    const statusColors = {
      EMABERTO: 'warning',
      VENCIDO: 'error',
      CANCELADO: 'info',
      RECEBIDO: 'success',
    };
    return statusColors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const statusTexts = {
      EMABERTO: 'Aguardando',
      VENCIDO: 'Vencida',
      CANCELADO: 'Cancelado',
      RECEBIDO: 'Pago',
    };
    return statusTexts[status] || status;
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('pt-BR');

  const cobrancas = getCobrancasFiltradas();
  const cobrancasExibidas = showMore.value ? cobrancas : cobrancas.slice(0, 8);

  if (loading) {
    return (
      <Card>
        <CardHeader title="Histórico de Cobranças" />
        <CardContent>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Carregando histórico...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader 
        title="Histórico de Cobranças"
        action={
          <Button
            component={RouterLink}
            href={paths.cliente.financeiro.contas}
            size="small"
            variant="outlined"
            endIcon={<Iconify icon="solar:arrow-right-bold" />}
          >
            Ver Todas
          </Button>
        }
      />

      {cobrancas.length > 0 ? (
        <>
          <Stack spacing={1.5} sx={{ px: { xs: 2, sm: 3 }, pt: 3 }}>
            {cobrancasExibidas.map((cobranca) => (
              <Stack 
                key={cobranca._id} 
                direction={{ xs: 'column', sm: 'row' }} 
                alignItems={{ xs: 'flex-start', sm: 'center' }} 
                spacing={{ xs: 1, sm: 2 }}
                sx={{ 
                  p: { xs: 2, sm: 0 },
                  borderRadius: { xs: 1, sm: 0 },
                  bgcolor: { xs: 'background.neutral', sm: 'transparent' }
                }}
              >
                <ListItemText
                  primary={cobranca.contrato?.titulo || 'Cobrança'}
                  secondary={formatDate(cobranca.dataVencimento)}
                  primaryTypographyProps={{ typography: 'body2', fontWeight: 'medium' }}
                  secondaryTypographyProps={{
                    mt: 0.5,
                    component: 'span',
                    typography: 'caption',
                    color: 'text.disabled',
                  }}
                  sx={{ flex: 1 }}
                />

                <Stack 
                  direction={{ xs: 'row', sm: 'column' }} 
                  alignItems={{ xs: 'center', sm: 'flex-end' }} 
                  spacing={{ xs: 2, sm: 1 }}
                  sx={{ minWidth: { xs: 'auto', sm: 120 } }}
                >
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 'bold',
                      fontSize: { xs: '0.875rem', sm: '0.875rem' }
                    }}
                  >
                    {formatToCurrency(cobranca.valor)}
                  </Typography>

                  <Chip
                    label={getStatusLabel(cobranca.status)}
                    color={getStatusColor(cobranca.status)}
                    size="small"
                    sx={{ minWidth: 80 }}
                  />
                </Stack>
              </Stack>
            ))}

            <Divider sx={{ borderStyle: 'dashed' }} />
          </Stack>

          {cobrancas.length > 8 && (
            <Stack alignItems="flex-start" sx={{ p: 2 }}>
              <Button
                size="small"
                color="inherit"
                startIcon={
                  <Iconify
                    width={16}
                    icon={showMore.value ? 'solar:arrow-up-bold' : 'solar:arrow-down-bold'}
                    sx={{ mr: -0.5 }}
                  />
                }
                onClick={showMore.onToggle}
              >
                {showMore.value ? 'Mostrar menos' : `Mostrar mais (${cobrancas.length - 8})`}
              </Button>
            </Stack>
          )}
        </>
      ) : (
        <CardContent>
          <Stack alignItems="center" spacing={2} sx={{ py: 4 }}>
            <Iconify icon="solar:bill-list-bold-duotone" width={48} sx={{ color: 'text.secondary' }} />
            <Typography variant="h6">Nenhuma cobrança encontrada</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Não há cobranças para o ano {anoSelecionado} com o filtro selecionado.
            </Typography>
          </Stack>
        </CardContent>
      )}
    </Card>
  );
}
