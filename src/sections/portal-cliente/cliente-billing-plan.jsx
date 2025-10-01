import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';

import axios from 'src/utils/axios';

import { Iconify } from 'src/components/iconify';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export function ClienteBillingPlan() {
  const { user } = useAuthContext();
  const [clienteData, setClienteData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClienteData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}cliente-portal/dashboard/${  user.userId}`);
        setClienteData(response.data.data.cliente);
      } catch (error) {
        console.error('Erro ao carregar dados do cliente:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.userId) {
      fetchClienteData();
    }
  }, [user?.userId]);

  if (loading) {
    return (
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Carregando informações do plano...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}>
      <CardHeader 
        title={
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
            📋 Plano Atual
          </Typography>
        }
        sx={{ color: 'white' }}
      />
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack spacing={1}>
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                {clienteData?.planoEmpresa?.toUpperCase() || 'N/A'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                {clienteData?.nome || 'Cliente'}
              </Typography>
            </Stack>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 64, height: 64 }}>
              <Iconify icon="solar:card-bold-duotone" width={32} />
            </Avatar>
          </Stack>

          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={{ xs: 3, sm: 4 }}
            sx={{ flexWrap: 'wrap' }}
          >
            <Stack spacing={1} sx={{ minWidth: { xs: '100%', sm: 120 } }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>
                Regime Tributário
              </Typography>
              <Typography variant="body1" sx={{ color: 'white', fontWeight: 'medium' }}>
                {clienteData?.regimeTributario?.toUpperCase() || 'N/A'}
              </Typography>
            </Stack>
            
            <Stack spacing={1} sx={{ minWidth: { xs: '100%', sm: 120 } }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>
                Código
              </Typography>
              <Typography variant="body1" sx={{ color: 'white', fontWeight: 'medium' }}>
                {clienteData?.codigo || 'N/A'}
              </Typography>
            </Stack>

            <Stack spacing={1} sx={{ minWidth: { xs: '100%', sm: 120 } }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>
                CNPJ
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'white', 
                  fontWeight: 'medium', 
                  fontFamily: 'monospace',
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  wordBreak: 'break-all'
                }}
              >
                {clienteData?.cnpj || 'N/A'}
              </Typography>
            </Stack>
          </Stack>

          {clienteData?.tributacao && clienteData.tributacao.length > 0 && (
            <Stack spacing={1}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>
                Tributação
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {clienteData.tributacao.map((trib, index) => (
                  <Box
                    key={index}
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      bgcolor: 'rgba(255,255,255,0.2)',
                      borderRadius: 1,
                      border: '1px solid rgba(255,255,255,0.3)'
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'white', textTransform: 'uppercase' }}>
                      {trib}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
