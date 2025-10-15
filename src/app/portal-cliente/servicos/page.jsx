'use client';

import React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { Box, Typography, Button, Stack, Card, CardContent, TextField, MenuItem, Chip, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, IconButton, InputAdornment } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { DataGrid } from '@mui/x-data-grid';

import { Iconify } from 'src/components/iconify';
import { SimplePaper } from 'src/components/paper/SimplePaper';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { toast } from 'src/components/snackbar';

import { useAuthContext } from 'src/auth/hooks';
import { useEmpresa } from 'src/hooks/use-empresa';
import { useSettings } from 'src/hooks/useSettings';
import { usePortalServicos, portalDeleteServico, portalUpdateServico } from 'src/actions/portal';

export default function PortalServicosPage() {
  const { user } = useAuthContext();
  const userId = user?.id || user?._id || user?.userId;
  const { empresaAtiva, loadingEmpresas } = useEmpresa(userId);
  const clienteProprietarioId = empresaAtiva;
  const { podeGerenciarServicos } = useSettings();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [filters, setFilters] = React.useState({ status: 'true', categoria: '', search: '' });
  const { data: servicos, isLoading, mutate } = usePortalServicos(clienteProprietarioId, filters);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [toDelete, setToDelete] = React.useState(null);

  if (loadingEmpresas || !clienteProprietarioId) return <Typography>Carregando...</Typography>;
  if (!podeGerenciarServicos) return (
    <Box>
      <Typography variant="h6">Funcionalidade não disponível</Typography>
      <Typography variant="body2" color="text.secondary">Peça ao administrador para ativar "Cadastro de Serviços" nas configurações.</Typography>
    </Box>
  );

  const isActive = (v) => v === true || v === 'true' || v === 1;

  const handleToggleStatus = async (row) => {
    const nextStatus = !isActive(row.status);
    mutate((prev) => (Array.isArray(prev) ? prev.map((r) => (r._id === row._id ? { ...r, status: nextStatus } : r)) : prev), false);
    try {
      await portalUpdateServico(row._id, { status: nextStatus });
    } catch (e) {
      toast.error('Erro ao alterar status');
      mutate();
    } finally {
      mutate();
    }
  };

  const handleDelete = async (id) => {
    try {
      await portalDeleteServico(id);
      toast.success('Serviço excluído');
      mutate();
    } catch (e) {
      toast.error('Erro ao excluir serviço');
    }
  };

  const columns = [
    { field: 'nome', headerName: 'Nome', flex: 1 },
    { field: 'categoria', headerName: 'Categoria', width: 160 },
    { field: 'valor', headerName: 'Valor', width: 140, valueGetter: (p) => (typeof p?.row?.valor === 'number' ? `R$ ${p.row.valor.toFixed(2)}` : '') },
    { field: 'unidade', headerName: 'Unid.', width: 100 },
    {
      field: 'actions', headerName: 'Ações', width: 160, sortable: false, renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <IconButton color="primary" href={`./${params.row._id}`}>
            <Iconify icon="solar:pen-bold" />
          </IconButton>
          <IconButton color={isActive(params.row.status) ? 'warning' : 'success'} onClick={() => handleToggleStatus(params.row)}>
            <Iconify icon={isActive(params.row.status) ? 'solar:forbidden-circle-bold' : 'solar:check-circle-bold'} />
          </IconButton>
          <IconButton color="error" onClick={() => { setToDelete(params.row._id); setConfirmOpen(true); }}>
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        </Stack>
      )
    }
  ];

  return (
    <SimplePaper>
      <CustomBreadcrumbs
        heading="Serviços"
        links={[{ name: 'Portal' }, { name: 'Serviços', href: paths.cliente.servicos }]}
        action={<Button href="./novo" variant="contained" startIcon={<Iconify icon="solar:add-circle-bold" />}>Novo Serviço</Button>}
        sx={{ mb: 2 }}
      />

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid xs={12} sm={6} md={4}>
              <TextField fullWidth label="Buscar" value={filters.search} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))} InputProps={{ startAdornment: (<InputAdornment position="start"><Iconify icon="solar:magnifer-bold" /></InputAdornment>) }} />
            </Grid>
            <Grid xs={12} sm={6} md={4}>
              <TextField fullWidth select label="Status" value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))} SelectProps={{ displayEmpty: true, renderValue: (v) => (v === '' ? 'Todos' : v === 'true' ? 'Ativos' : 'Inativos') }} InputLabelProps={{ shrink: true }}>
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="true">Ativos</MenuItem>
                <MenuItem value="false">Inativos</MenuItem>
              </TextField>
            </Grid>
            <Grid xs={12} sm={6} md={4}>
              <TextField fullWidth label="Categoria" value={filters.categoria} onChange={(e) => setFilters((f) => ({ ...f, categoria: e.target.value }))} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {isMobile ? (
        <Stack spacing={2}>
          {(Array.isArray(servicos) ? servicos : []).map((s) => (
            <Card key={s._id} variant="outlined">
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Stack>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{s.nome}</Typography>
                    <Typography variant="body2" color="text.secondary">{s.categoria}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <IconButton color="primary" href={`./${s._id}`} size="small"><Iconify icon="solar:pen-bold" /></IconButton>
                    <IconButton color={isActive(s.status) ? 'warning' : 'success'} size="small" onClick={() => handleToggleStatus(s)}><Iconify icon={isActive(s.status) ? 'solar:forbidden-circle-bold' : 'solar:check-circle-bold'} /></IconButton>
                    <IconButton color="error" size="small" onClick={() => { setToDelete(s._id); setConfirmOpen(true); }}><Iconify icon="solar:trash-bin-trash-bold" /></IconButton>
                  </Stack>
                </Stack>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Chip size="small" label={isActive(s.status) ? 'Ativo' : 'Inativo'} color={isActive(s.status) ? 'success' : 'default'} variant={isActive(s.status) ? 'soft' : 'outlined'} />
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : (
        <div style={{ height: 520, width: '100%' }}>
          <DataGrid loading={isLoading} rows={Array.isArray(servicos) ? servicos : []} getRowId={(r) => r._id} columns={columns} disableRowSelectionOnClick pageSizeOptions={[10, 25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} />
        </div>
      )}

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} fullScreen={isMobile}>
        <DialogTitle>Excluir serviço?</DialogTitle>
        <DialogContent>
          <DialogContentText>Esta ação não poderá ser desfeita. Deseja realmente excluir?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={async () => { if (toDelete) { await handleDelete(toDelete); } setConfirmOpen(false); setToDelete(null); }}>Excluir</Button>
        </DialogActions>
      </Dialog>
    </SimplePaper>
  );
}


