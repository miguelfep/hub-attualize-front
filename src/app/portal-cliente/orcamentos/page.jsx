'use client';

import React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { Box, Typography, Button, Stack, Card, CardContent, TextField, MenuItem, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { Iconify } from 'src/components/iconify';
import { SimplePaper } from 'src/components/paper/SimplePaper';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';

import { useAuthContext } from 'src/auth/hooks';
import { useEmpresa } from 'src/hooks/use-empresa';

import { useSettings } from 'src/hooks/useSettings';
import { usePortalOrcamentos, usePortalOrcamentosStats } from 'src/actions/portal';

export default function PortalOrcamentosPage() {
  const { user } = useAuthContext();
  const userId = user?.id || user?._id || user?.userId;
  const { empresaAtiva, loadingEmpresas } = useEmpresa(userId);
  const clienteProprietarioId = empresaAtiva;
  const { podeCriarOrcamentos } = useSettings();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [filters, setFilters] = React.useState({ status: '', dataInicio: '', dataFim: '' });
  const { data: orcamentos, isLoading } = usePortalOrcamentos(clienteProprietarioId, filters);
  const { data: stats } = usePortalOrcamentosStats(clienteProprietarioId);

  if (loadingEmpresas || !clienteProprietarioId) return <Typography>Carregando...</Typography>;
  if (!podeCriarOrcamentos) return (
    <Box>
      <Typography variant="h6">Funcionalidade não disponível</Typography>
      <Typography variant="body2" color="text.secondary">Peça ao administrador para ativar "Vendas/Orçamentos" nas configurações.</Typography>
    </Box>
  );

  return (
    <SimplePaper>
      <CustomBreadcrumbs
        heading="Orçamentos"
        links={[{ name: 'Portal' }, { name: 'Orçamentos', href: paths.cliente.orcamentos }]}
        action={<Button href="./novo" variant="contained" startIcon={<Iconify icon="solar:add-circle-bold" />}>Novo Orçamento</Button>}
        sx={{ mb: 2 }}
      />

      {stats && (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid xs={6} sm={4} md={2}>
            <Card><CardContent><Stack><Typography variant="caption" color="text.secondary">Pendentes</Typography><Typography variant="h6">{stats.totalPendentes}</Typography></Stack></CardContent></Card>
          </Grid>
          <Grid xs={6} sm={4} md={2}>
            <Card><CardContent><Stack><Typography variant="caption" color="text.secondary">Aprovados</Typography><Typography variant="h6">{stats.totalAprovados}</Typography></Stack></CardContent></Card>
          </Grid>
          <Grid xs={6} sm={4} md={2}>
            <Card><CardContent><Stack><Typography variant="caption" color="text.secondary">Convertidos</Typography><Typography variant="h6">{stats.totalConvertidos}</Typography></Stack></CardContent></Card>
          </Grid>
          <Grid xs={6} sm={4} md={3}>
            <Card><CardContent><Stack><Typography variant="caption" color="text.secondary">Valor Total</Typography><Typography variant="h6">R$ {Number(stats.valorTotal || 0).toFixed(2)}</Typography></Stack></CardContent></Card>
          </Grid>
          <Grid xs={6} sm={4} md={3}>
            <Card><CardContent><Stack><Typography variant="caption" color="text.secondary">Taxa Conversão</Typography><Typography variant="h6">{stats.taxaConversao}%</Typography></Stack></CardContent></Card>
          </Grid>
        </Grid>
      )}

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid xs={12} sm={4}>
              <TextField fullWidth select label="Status" value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))} SelectProps={{ displayEmpty: true, renderValue: (v) => (v === '' ? 'Todos' : v) }} InputLabelProps={{ shrink: true }}>
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="pendente">Pendente</MenuItem>
                <MenuItem value="aprovado">Aprovado</MenuItem>
                <MenuItem value="convertido">Convertido</MenuItem>
                <MenuItem value="recusado">Recusado</MenuItem>
                <MenuItem value="expirado">Expirado</MenuItem>
              </TextField>
            </Grid>
            <Grid xs={12} sm={4}>
              <TextField fullWidth type="date" label="Início" value={filters.dataInicio} onChange={(e) => setFilters((f) => ({ ...f, dataInicio: e.target.value }))} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid xs={12} sm={4}>
              <TextField fullWidth type="date" label="Fim" value={filters.dataFim} onChange={(e) => setFilters((f) => ({ ...f, dataFim: e.target.value }))} InputLabelProps={{ shrink: true }} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Stack spacing={2}>
        {(Array.isArray(orcamentos) ? orcamentos : []).map((o) => (
          <Card key={o._id} variant="outlined">
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Stack>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{o.numero}</Typography>
                  <Typography variant="body2" color="text.secondary">Cliente: {o?.clienteDoClienteId?.nome}</Typography>
                </Stack>
                <Stack direction="row" spacing={1}>
                  <Chip size="small" label={o.status} />
                  <Button href={`./${o._id}`} size="small" variant="outlined">Ver</Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </SimplePaper>
  );
}


