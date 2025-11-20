'use client';

import { useState } from 'react';

import {
  Container,
  Stack,
  Card,
  Typography,
  TextField,
  Grid,
  Box,
  Avatar,
  LinearProgress,
  Chip,
  IconButton,
  InputAdornment,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useGetAllClientes } from 'src/actions/clientes';

// ----------------------------------------------------------------------

export function ClientesApuracaoListView() {
  const router = useRouter();

  const [busca, setBusca] = useState('');

  // Buscar clientes com apuração habilitada
  const { data: clientes, isLoading } = useGetAllClientes({
    status: true,
    apurarHub: true,
  });

  const clientesFiltrados = clientes?.filter(
    (cliente) =>
      !busca ||
      cliente.nome?.toLowerCase().includes(busca.toLowerCase()) ||
      cliente.razao_social?.toLowerCase().includes(busca.toLowerCase()) ||
      cliente.cnpj?.includes(busca)
  );

  const handleClienteClick = (clienteId) => {
    router.push(`${paths.dashboard.fiscal.apuracao}/cliente/${clienteId}/detalhes`);
  };

  return (
    <Container maxWidth="xl">
      <CustomBreadcrumbs
        heading="Clientes - Apuração de Impostos"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Fiscal', href: paths.dashboard.fiscal.root },
          { name: 'Apuração', href: paths.dashboard.fiscal.apuracao },
          { name: 'Clientes' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {isLoading && <LinearProgress sx={{ mb: 3 }} />}

      <Stack spacing={3}>
        {/* Busca */}
        <Card sx={{ p: 2 }}>
          <TextField
            fullWidth
            placeholder="Buscar por nome, razão social ou CNPJ..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="solar:magnifer-bold-duotone" />
                </InputAdornment>
              ),
              endAdornment: busca && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setBusca('')}>
                    <Iconify icon="solar:close-circle-bold-duotone" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Card>

        {/* Grid de Clientes */}
        <Grid container spacing={3}>
          {clientesFiltrados?.map((cliente) => (
            <Grid item xs={12} sm={6} md={4} key={cliente._id || cliente.id}>
              <Card
                sx={{
                  p: 3,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: (theme) => theme.customShadows.z20,
                    transform: 'translateY(-4px)',
                  },
                }}
                onClick={() => handleClienteClick(cliente._id || cliente.id)}
              >
                <Stack spacing={2}>
                  {/* Cabeçalho com Avatar */}
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        bgcolor: 'primary.lighter',
                        color: 'primary.main',
                        fontSize: 20,
                        fontWeight: 'bold',
                      }}
                    >
                      {(cliente.nome || cliente.razao_social || 'C')
                        .substring(0, 2)
                        .toUpperCase()}
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="subtitle1" noWrap>
                        {cliente.nome || cliente.razao_social}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {cliente.cnpj}
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Status/Badges */}
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {cliente.regime_tributario && (
                      <Chip
                        label={cliente.regime_tributario}
                        size="small"
                        color="info"
                        variant="outlined"
                      />
                    )}
                    {cliente.atividade_principal && (
                      <Chip
                        label={
                          typeof cliente.atividade_principal[0]?.text === 'string'
                            ? cliente.atividade_principal.length > 20
                              ? cliente.atividade_principal[0]?.text?.substring(0, 20) + '...'
                              : cliente.atividade_principal[0]?.text
                            : String(cliente.atividade_principal[0]?.text)
                        }
                        size="small"
                        variant="soft"
                      />
                    )}
                  </Stack>

                  {/* Ação */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      pt: 1,
                      borderTop: '1px dashed',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Ver apuração
                    </Typography>
                    <Iconify icon="solar:alt-arrow-right-bold-duotone" width={20} />
                  </Box>
                </Stack>
              </Card>
            </Grid>
          ))}

          {!isLoading && clientesFiltrados?.length === 0 && (
            <Grid item xs={12}>
              <Card sx={{ p: 5, textAlign: 'center' }}>
                <Iconify
                  icon="solar:users-group-rounded-bold-duotone"
                  width={80}
                  sx={{ color: 'text.disabled', mb: 2 }}
                />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {busca ? 'Nenhum cliente encontrado' : 'Nenhum cliente com apuração habilitada'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {busca
                    ? 'Tente buscar por outro termo'
                    : 'Configure clientes com apuração no Hub para começar'}
                </Typography>
              </Card>
            </Grid>
          )}
        </Grid>

        {/* Informação */}
        {!isLoading && clientesFiltrados && clientesFiltrados.length > 0 && (
          <Card sx={{ p: 2, bgcolor: 'background.neutral' }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Iconify icon="solar:info-circle-bold-duotone" width={24} color="info.main" />
              <Box>
                <Typography variant="subtitle2">
                  {clientesFiltrados.length} cliente(s) com apuração habilitada
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Clique em um cliente para gerenciar histórico, calcular impostos e fazer upload
                  de DAS
                </Typography>
              </Box>
            </Stack>
          </Card>
        )}
      </Stack>
    </Container>
  );
}

