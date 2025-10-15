'use client';

import { useState } from 'react';
import { mutate as mutateGlobal } from 'swr';

import { DataGrid } from '@mui/x-data-grid';
import Grid from '@mui/material/Unstable_Grid2';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Box, Card, Chip, Stack, Button, Dialog, MenuItem, TextField, Typography, IconButton, CardContent, DialogTitle, DialogContent, DialogActions, InputAdornment, DialogContentText } from '@mui/material';

import { paths } from 'src/routes/paths';

import { useEmpresa } from 'src/hooks/use-empresa';
import { useSettings } from 'src/hooks/useSettings';

import { endpoints } from 'src/utils/axios';

import { usePortalClientes, portalDeleteCliente, portalUpdateCliente } from 'src/actions/portal';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { SimplePaper } from 'src/components/paper/SimplePaper';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useAuthContext } from 'src/auth/hooks';

export default function PortalClientesPage() {
  const { user } = useAuthContext();
  const userId = user?.id || user?._id || user?.userId;
  const { empresaAtiva, loadingEmpresas } = useEmpresa(userId);
  const clienteProprietarioId = empresaAtiva;

  const { podeGerenciarClientes, limiteClientes } = useSettings();

  const [filters, setFilters] = useState({ status: '', tipoPessoa: '', search: '' });
  const { data: clientes, isLoading, mutate } = usePortalClientes(clienteProprietarioId, filters);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const isActive = (v) => v === true || v === 'true' || v === 1;

  const [toggling, setToggling] = useState([]);

  if (loadingEmpresas || !clienteProprietarioId) {
    return <Typography>Carregando...</Typography>;
  }

  if (!podeGerenciarClientes) {
    return (
      <Box>
        <Typography variant="h6">Funcionalidade não disponível</Typography>
        <Typography variant="body2" color="text.secondary">Peça ao administrador para ativar Cadastro de Clientes nas configurações.</Typography>
      </Box>
    );
  }

  const handleDelete = async (id) => {
    try {
      await portalDeleteCliente(clienteProprietarioId, id);
      toast.success('Cliente excluído');
      mutate();
    } catch (error) {
      toast.error('Erro ao excluir cliente');
    }
  };

  const handleToggleStatus = async (row) => {
    const nextStatus = !isActive(row.status);
    // Otimista
    mutate((prev) => {
      if (!Array.isArray(prev)) return prev;
      return prev.map((r) => (r._id === row._id ? { ...r, status: nextStatus } : r));
    }, false);
    try {
      setToggling((list) => [...list, row._id]);
      await portalUpdateCliente(clienteProprietarioId, row._id, { status: nextStatus });
      toast.success(nextStatus ? 'Cliente ativado' : 'Cliente inativado');
    } catch (error) {
      toast.error('Erro ao alterar status');
      // reverte em caso de erro
      mutate();
    } finally {
      setToggling((list) => list.filter((id) => id !== row._id));
      // revalida para garantir consistência com filtro
      mutate();
      // revalida todas as listas desse proprietário (ativos/inativos/todos)
      const base = endpoints.portal.clientes.list(clienteProprietarioId);
      await mutateGlobal((key) => typeof key === 'string' && key.startsWith(base), undefined, true);
    }
  };

  const columns = [
    { field: 'nome', headerName: 'Nome', flex: 1 },
    { field: 'razaoSocial', headerName: 'Razão Social', flex: 1, valueGetter: (params) => (params?.row?.razaoSocial ?? '') },
    { field: 'cpfCnpj', headerName: 'CPF/CNPJ', width: 180 },
    { field: 'email', headerName: 'Email', width: 220 },
    { field: 'telefone', headerName: 'Telefone', width: 160 },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 140,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <IconButton color="primary" href={`./${params.row._id}`}>
            <Iconify icon="solar:pen-bold" />
          </IconButton>
          <IconButton color={isActive(params.row.status) ? 'warning' : 'success'} disabled={toggling.includes(params.row._id)} onClick={() => handleToggleStatus(params.row)}>
            <Iconify icon={isActive(params.row.status) ? 'solar:forbidden-circle-bold' : 'solar:check-circle-bold'} />
          </IconButton>
          <IconButton color="error" onClick={() => { setToDelete(params.row._id); setConfirmOpen(true); }}>
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <SimplePaper>
      <CustomBreadcrumbs
        heading="Clientes"
        links={[{ name: 'Portal' }, { name: 'Clientes', href: paths.cliente.clientes }]}
        action={
          <Stack direction="row" spacing={2} alignItems="center">
            {limiteClientes && (
              <Chip label={`${Array.isArray(clientes) ? clientes.length : 0} / ${limiteClientes}`} size="small" color="info" variant="soft" />
            )}
            <Button href="./novo" variant="contained" startIcon={<Iconify icon="solar:add-circle-bold" />}>Novo Cliente</Button>
          </Stack>
        }
        sx={{ mb: 2 }}
      />

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Buscar"
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="solar:magnifer-bold" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                select
                label="Status"
                value={filters.status}
                onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
                SelectProps={{
                  displayEmpty: true,
                  renderValue: (v) => (v === '' ? 'Todos' : v === 'true' ? 'Ativos' : 'Inativos'),
                }}
                InputLabelProps={{ shrink: true }}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="true">Ativos</MenuItem>
                <MenuItem value="false">Inativos</MenuItem>
              </TextField>
            </Grid>
            <Grid xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                select
                label="Tipo de Pessoa"
                value={filters.tipoPessoa}
                onChange={(e) => setFilters((f) => ({ ...f, tipoPessoa: e.target.value }))}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="fisica">Física</MenuItem>
                <MenuItem value="juridica">Jurídica</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {isMobile ? (
        <Stack spacing={2}>
          {(Array.isArray(clientes) ? clientes : []).map((c) => (
            <Card key={c._id} variant="outlined">
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{c.nome}</Typography>
                  <Stack direction="row" spacing={1}>
                    <IconButton color="primary" href={`./${c._id}`} size="small">
                      <Iconify icon="solar:pen-bold" />
                    </IconButton>
                    <IconButton color={isActive(c.status) ? 'warning' : 'success'} size="small" disabled={toggling.includes(c._id)} onClick={() => handleToggleStatus(c)}>
                      <Iconify icon={c.status ? 'solar:forbidden-circle-bold' : 'solar:check-circle-bold'} />
                    </IconButton>
                    <IconButton color="error" size="small" onClick={() => { setToDelete(c._id); setConfirmOpen(true); }}>
                      <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                  </Stack>
                </Stack>
                {!!c.razaoSocial && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontStyle: 'italic' }}>{c.razaoSocial}</Typography>
                )}
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>{c.cpfCnpj}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>{c.email}</Typography>
                <Typography variant="body2" color="text.secondary">{c.telefone}</Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Chip size="small" label={isActive(c.status) ? 'Ativo' : 'Inativo'} color={isActive(c.status) ? 'success' : 'default'} variant={isActive(c.status) ? 'soft' : 'outlined'} />
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : (
        <div style={{ height: 520, width: '100%' }}>
          <DataGrid
            loading={isLoading}
            rows={Array.isArray(clientes) ? clientes : []}
            getRowId={(row) => row._id}
            columns={columns}
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          />
        </div>
      )}

      <Dialog fullScreen={isMobile} open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Excluir cliente?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Esta ação não poderá ser desfeita. Deseja realmente excluir este cliente?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={async () => { if (toDelete) { await handleDelete(toDelete); } setConfirmOpen(false); setToDelete(null); }}>Excluir</Button>
        </DialogActions>
      </Dialog>
    </SimplePaper>
  );
}


