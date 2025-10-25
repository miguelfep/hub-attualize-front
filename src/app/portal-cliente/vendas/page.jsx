'use client';

import React from 'react';

import Grid from '@mui/material/Unstable_Grid2';
import { alpha, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Box, Card, Chip, Stack, Table, Button, Tooltip, MenuItem, Skeleton, TableRow, TextField, TableBody, TableCell, Typography, IconButton, CardContent, TableContainer, TablePagination } from '@mui/material';

import { useEmpresa } from 'src/hooks/use-empresa';
import { useSettings } from 'src/hooks/useSettings';

import { applySortFilter } from 'src/utils/constants/table-utils';

import { usePortalOrcamentos, usePortalOrcamentosStats, portalUpdateOrcamentoStatus } from 'src/actions/portal';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { SimplePaper } from 'src/components/paper/SimplePaper';
import { useTable, getComparator } from 'src/components/table';

import { TableHeadCustom } from 'src/sections/clientes/TableHeadCustom';

import { useAuthContext } from 'src/auth/hooks';

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

  const table = useTable({ defaultOrderBy: 'numero' });

  const [statusEdits, setStatusEdits] = React.useState({});
  const [savingMap, setSavingMap] = React.useState({});

  const dataFiltered = applySortFilter({
    inputData: Array.isArray(orcamentos) ? orcamentos : [],
    comparator: getComparator(table.order, table.orderBy),
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pago':
        return 'success';
      case 'aprovado':
        return 'info';
      case 'recusado':
        return 'error';
      case 'pendente':
        return 'warning';
      default:
        return 'default';
    }
  };

  const TABLE_HEAD = [
    { id: 'numero', label: 'Número', width: 160 },
    { id: 'cliente', label: 'Cliente', width: 320 },
    { id: 'status', label: 'Status', width: 140 },
    { id: 'data', label: 'Validade', width: 140 },
    { id: 'acoes', label: 'Ações', width: 200, align: 'right' },
  ];

  const handleStatusUpdate = async (id) => {
    const newStatus = statusEdits[id];
    if (!newStatus) return;
    try {
      setSavingMap((m) => ({ ...m, [id]: true }));
      await portalUpdateOrcamentoStatus(id, { status: newStatus, clienteProprietarioId });
      toast.success('Status atualizado');
    } catch (e) {
      toast.error('Erro ao atualizar status');
    } finally {
      setSavingMap((m) => ({ ...m, [id]: false }));
    }
  };

  if (loadingEmpresas || !clienteProprietarioId) return (
    <SimplePaper>
      <Skeleton variant="text" width={180} height={32} sx={{ mb: 2 }} />
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid xs={6} sm={4} md={2}><Skeleton variant="rounded" height={80} /></Grid>
        <Grid xs={6} sm={4} md={2}><Skeleton variant="rounded" height={80} /></Grid>
        <Grid xs={6} sm={4} md={2}><Skeleton variant="rounded" height={80} /></Grid>
        <Grid xs={6} sm={4} md={3}><Skeleton variant="rounded" height={80} /></Grid>
        <Grid xs={6} sm={4} md={3}><Skeleton variant="rounded" height={80} /></Grid>
      </Grid>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid xs={12} sm={4}><Skeleton variant="rounded" height={40} /></Grid>
            <Grid xs={12} sm={4}><Skeleton variant="rounded" height={40} /></Grid>
            <Grid xs={12} sm={4}><Skeleton variant="rounded" height={40} /></Grid>
          </Grid>
        </CardContent>
      </Card>
      <Stack spacing={2}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={76} />
        ))}
      </Stack>
    </SimplePaper>
  );
  if (!podeCriarOrcamentos) return (
    <Box>
      <Typography variant="h6">Funcionalidade não disponível</Typography>
      <Typography variant="body2" color="text.secondary">Peça ao administrador para ativar &quot;Vendas/Orçamentos&quot; nas configurações.</Typography>
    </Box>
  );

  return (
    <SimplePaper>
      <Card sx={{ borderRadius: 3, mb: 2 }}>
        <Box
          sx={{
            p: 3,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`
          }}
        >
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              Minhas Vendas
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
              Visualize, gerencie e cadastre suas vendas.
            </Typography>
          </Box>
          <Button href="./novo" variant="contained" startIcon={<Iconify icon="solar:add-circle-bold" />}>Nova Venda</Button>
        </Box>
      </Card>

      {stats && (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid xs={6} sm={4} md={2}>
            <Card><CardContent><Stack><Typography variant="caption" color="text.secondary">Pendentes</Typography><Typography variant="h6">{stats.totalPendentes}</Typography></Stack></CardContent></Card>
          </Grid>
          <Grid xs={6} sm={4} md={2}>
            <Card><CardContent><Stack><Typography variant="caption" color="text.secondary">Aprovados</Typography><Typography variant="h6">{stats.totalAprovados}</Typography></Stack></CardContent></Card>
          </Grid>
          <Grid xs={6} sm={4} md={2}>
            <Card><CardContent><Stack><Typography variant="caption" color="text.secondary">Pagos</Typography><Typography variant="h6">{stats.totalPagos}</Typography></Stack></CardContent></Card>
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
                <MenuItem value="pago">Pago</MenuItem>
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

      <Card>
        <CardContent sx={{ p: { xs: 2, md: 0 } }}>
          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <Table size={table.dense ? 'small' : 'medium'}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headLabel={TABLE_HEAD}
                onSort={table.onSort}
              />
              <TableBody>
                {isLoading
                  ? [...Array(5)].map((_, i) => (
                      <TableRow key={`sk-${i}`}>
                        <TableCell colSpan={TABLE_HEAD.length}>
                          <Skeleton variant="rounded" height={56} />
                        </TableCell>
                      </TableRow>
                    ))
                  : dataFiltered
                      .slice(
                        table.page * table.rowsPerPage,
                        table.page * table.rowsPerPage + table.rowsPerPage
                      )
                      .map((o) => (
                        <TableRow key={o._id} hover>
                          <TableCell>
                            <Button href={`./${o._id}`} variant="text" sx={{ px: 0, pl: 1, minWidth: 0, fontWeight: 600, fontFamily: 'monospace' }}>
                              {o.numero}
                            </Button>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 360 }}>{o?.clienteDoClienteId?.nome}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip size="small" label={o.status} color={getStatusColor(o.status)} />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{o?.dataValidade ? new Date(o.dataValidade).toLocaleDateString() : '-'}</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                              <Tooltip title="Ver venda">
                                <IconButton href={`./${o._id}`} size="small" color="primary">
                                  <Iconify icon="solar:eye-bold" />
                                </IconButton>
                              </Tooltip>
                              {o?.notaFiscalId?.linkNota && (
                                <Tooltip title="Ver NFSe (PDF)">
                                  <IconButton href={o.notaFiscalId.linkNota} target="_blank" rel="noopener noreferrer" size="small" color="default">
                                    <Iconify icon="solar:document-text-bold" />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={dataFiltered.length}
            rowsPerPage={table.rowsPerPage}
            page={table.page}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
          />
        </CardContent>
      </Card>
    </SimplePaper>
  );
}


