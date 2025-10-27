'use client';

import React from 'react';
import { toast } from 'sonner';
import { LazyMotion, m as motion, domAnimation } from 'framer-motion';

import Grid from '@mui/material/Unstable_Grid2';
import { alpha, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  Box,
  Card,
  Chip,
  Stack,
  Table,
  Button,
  Tooltip,
  MenuItem,
  TableRow,
  TextField,
  TableBody,
  TableCell,
  Typography,
  IconButton,
  CardContent,
  TableContainer,
  TablePagination,
} from '@mui/material';

import { useEmpresa } from 'src/hooks/use-empresa';
import { useSettings } from 'src/hooks/useSettings';

import { toTitleCase } from 'src/utils/helper';
import { applySortFilter } from 'src/utils/constants/table-utils';

import {
  usePortalOrcamentos,
  usePortalOrcamentosStats,
  portalUpdateOrcamentoStatus,
} from 'src/actions/portal';

import { Iconify } from 'src/components/iconify';
import { useTable, getComparator } from 'src/components/table';
import { VendasPageSkeleton } from 'src/components/skeleton/PortalVendasPageSkeleton';
import { VendaTableRowSkeleton } from 'src/components/skeleton/VendasTableRowSkeleton';

import { TableHeadCustom } from 'src/sections/clientes/TableHeadCustom';

import { useAuthContext } from 'src/auth/hooks';

function ServiceOrderMobileCard({ serviceOrder, getStatusColor }) {
  return (
    <Card variant="outlined" sx={{ '&:hover': { boxShadow: (theme) => theme.customShadows.z16 } }}>
      <CardContent sx={{ p: 2 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          sx={{ mb: 2 }}
        >
          <Box sx={{ maxWidth: 'calc(100% - 100px)' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
              Venda #{serviceOrder.numero}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {serviceOrder?.clienteDoClienteId?.nome}
            </Typography>
          </Box>
          <Chip
            size="small"
            label={serviceOrder.status}
            color={getStatusColor(serviceOrder.status)}
            variant="soft"
          />
        </Stack>
        <Stack spacing={1} sx={{ mb: 2, p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
          <Typography variant="body2">
            <strong>Validade:</strong>{' '}
            {serviceOrder?.dataValidade
              ? new Date(serviceOrder.dataValidade).toLocaleDateString()
              : '-'}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          {serviceOrder?.notaFiscalId?.linkNota && (
            <Tooltip title="Ver NFSe (PDF)">
              <IconButton
                href={serviceOrder.notaFiscalId.linkNota}
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                color="default"
              >
                <Iconify icon="solar:document-text-bold" />
              </IconButton>
            </Tooltip>
          )}
          <Button
            href={`./${serviceOrder._id}`}
            variant="contained"
            color="primary"
            size="small"
            startIcon={<Iconify icon="solar:eye-bold" />}
          >
            Ver Venda
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

function StatCard({ title, value }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack spacing={0.5}>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h6" noWrap>
            {value}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

// =======================================================================
// COMPONENTE PRINCIPAL DA PÁGINA
// =======================================================================

export default function PortalOrcamentosPage() {
  const { user } = useAuthContext();
  const userId = user?.id || user?._id || user?.userId;
  const { empresaAtiva, loadingEmpresas } = useEmpresa(userId);
  const clienteProprietarioId = empresaAtiva;
  const { podeCriarOrcamentos, limiteOrcamentos } = useSettings();

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

  const TABLE_HEAD = [
    { id: 'numero', label: 'Número', width: 160 },
    { id: 'cliente', label: 'Cliente' },
    { id: 'status', label: 'Status', width: 140 },
    { id: 'data', label: 'Validade', width: 140 },
    { id: 'acoes', label: 'Ações', width: 120, align: 'right' },
  ];

  if (loadingEmpresas || !clienteProprietarioId) return <VendasPageSkeleton />;

  if (!podeCriarOrcamentos)
    return (
      <Box>
        <Typography variant="h6">Funcionalidade não disponível</Typography>
        <Typography variant="body2" color="text.secondary">
          Peça ao administrador para ativar &quot;Vendas/Orçamentos&quot; nas configurações.
        </Typography>
      </Box>
    );

  return (
    <LazyMotion features={domAnimation}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <Card sx={{ borderRadius: 3 }}>
          <Box
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' }, // Empilha na vertical no mobile (xs)
              alignItems: { sm: 'center' }, // Centraliza verticalmente no desktop (sm)
              justifyContent: 'space-between',
              gap: 2,
              background: `linear-gradient(135deg, ${alpha(
                theme.palette.primary.main,
                0.1
              )}, ${alpha(theme.palette.secondary.main, 0.1)})`,
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
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{ alignSelf: { xs: 'flex-end', sm: 'center' } }}
            >
              {limiteOrcamentos && (
                <Chip
                  label={`${dataFiltered.length} / ${limiteOrcamentos}`}
                  size="small"
                  sx={{ bgcolor: 'black', color: 'common.white' }}
                />
              )}
              <Button
                href="./novo"
                variant="contained"
                color="primary"
                startIcon={<Iconify icon="solar:add-circle-bold" />}
              >
                Novo Orçamento
              </Button>
            </Stack>
          </Box>

          {stats && (
            <Box sx={{ p: 2.5 }}>
              <Grid container spacing={2}>
                <Grid xs={12} sm={6} md={2.4}>
                  <StatCard title="Pendentes" value={stats.totalPendentes} />
                </Grid>
                <Grid xs={12} sm={6} md={2.4}>
                  <StatCard title="Aprovados" value={stats.totalAprovados} />
                </Grid>
                <Grid xs={12} sm={6} md={2.4}>
                  <StatCard title="Pagos" value={stats.totalPagos} />
                </Grid>
                <Grid xs={12} sm={6} md={2.4}>
                  <StatCard
                    title="Valor Total"
                    value={new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(stats.valorTotal || 0)}
                  />
                </Grid>
                <Grid xs={12} sm={12} md={2.4}>
                  <StatCard title="Taxa Conversão" value={`${stats.taxaConversao}%`} />
                </Grid>
              </Grid>
            </Box>
          )}

          <Box sx={{ p: 2.5, borderTop: 1, borderBottom: 1, borderColor: 'divider' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  size='small'
                  value={filters.status}
                  onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="pendente">Pendente</MenuItem>
                  <MenuItem value="aprovado">Aprovado</MenuItem>
                  <MenuItem value="pago">Pago</MenuItem>
                  <MenuItem value="recusado">Recusado</MenuItem>
                  <MenuItem value="expirado">Expirado</MenuItem>
                </TextField>
              </Grid>
              <Grid xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="Início"
                  value={filters.dataInicio}
                  onChange={(e) => setFilters((f) => ({ ...f, dataInicio: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="Fim"
                  value={filters.dataFim}
                  onChange={(e) => setFilters((f) => ({ ...f, dataFim: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Box>

          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            {isMobile ? (
              <Stack spacing={2}>
                {dataFiltered
                  .slice(
                    table.page * table.rowsPerPage,
                    table.page * table.rowsPerPage + table.rowsPerPage
                  )
                  .map((order, index) => (
                    <motion.div
                      key={order._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <ServiceOrderMobileCard
                        serviceOrder={order}
                        getStatusColor={getStatusColor}
                      />
                    </motion.div>
                  ))}
              </Stack>
            ) : (
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
                      ? [...Array(5)].map((_, i) => <VendaTableRowSkeleton key={i} />)
                      : dataFiltered
                          .slice(
                            table.page * table.rowsPerPage,
                            table.page * table.rowsPerPage + table.rowsPerPage
                          )
                          .map((o) => (
                            <TableRow key={o._id} hover>
                              <TableCell>
                                <Button
                                  href={`./${o._id}`}
                                  variant="text"
                                  sx={{
                                    px: 0,
                                    pl: 1,
                                    minWidth: 0,
                                    fontWeight: 600,
                                    fontFamily: 'monospace',
                                  }}
                                >
                                  {o.numero}
                                </Button>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" noWrap sx={{ maxWidth: 360 }}>
                                  {o?.clienteDoClienteId?.nome}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  size="small"
                                  label={toTitleCase(o?.status)}
                                  color={getStatusColor(o.status)}
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {o?.dataValidade
                                    ? new Date(o.dataValidade).toLocaleDateString()
                                    : '-'}
                                </Typography>
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
                                      <IconButton
                                        href={o.notaFiscalId.linkNota}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        size="small"
                                        color="default"
                                      >
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
            )}
          </CardContent>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={dataFiltered.length}
            rowsPerPage={table.rowsPerPage}
            page={table.page}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
          />
        </Card>
      </motion.div>
    </LazyMotion>
  );
}
