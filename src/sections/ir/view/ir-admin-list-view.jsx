'use client';

import { ptBR } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import { alpha, useTheme } from '@mui/material/styles';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Grid from '@mui/material/Unstable_Grid2';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControl from '@mui/material/FormControl';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';

import { fCurrency } from 'src/utils/format-number';

import {
  IR_STATUS_LABELS,
  useGetPedidosIrAdmin,
  useGetIrAdminResumoFinanceiro,
  exportarPedidosIrAdmin,
  useGetUsuariosInternosIr,
} from 'src/actions/ir';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import IrStatusBadge from 'src/components/ir/IrStatusBadge';
import { IrResumoFinanceiroCards } from 'src/components/ir/IrResumoFinanceiroCards';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

const FORMAS_PAGAMENTO = [
  { value: 'credit_card', label: 'Cartão', icon: 'eva:credit-card-fill' },
  { value: 'boleto', label: 'Boleto', icon: 'eva:file-text-outline' },
  { value: 'pix', label: 'PIX', icon: 'eva:flash-fill' },
];

function formatData(isoString) {
  try {
    return format(parseISO(isoString), 'dd/MM/yyyy', { locale: ptBR });
  } catch {
    return '-';
  }
}

// ----------------------------------------------------------------------

const ROLES_RESUMO_FINANCEIRO_IR = ['admin', 'superadmin', 'financeiro'];

export default function IrAdminListView() {
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuthContext();
  const { data: usuariosInternos } = useGetUsuariosInternosIr();

  const [filtros, setFiltros] = useState({ status: '', year: '', responsavelId: '', page: 1, limit: 20 });
  const [filtrosAplicados, setFiltrosAplicados] = useState({ page: 1, limit: 20 });
  const [exportando, setExportando] = useState(false);

  const { data, isLoading } = useGetPedidosIrAdmin(filtrosAplicados);

  const showResumoFinanceiro = ROLES_RESUMO_FINANCEIRO_IR.includes(user?.role);
  const { data: resumoFinanceiro, isLoading: loadingResumo, error: errorResumo } = useGetIrAdminResumoFinanceiro(
    showResumoFinanceiro,
    filtrosAplicados
  );

  const showTipoPgtoValor = user?.role === 'admin' || user?.role === 'financeiro';
  const usuariosList = Array.isArray(usuariosInternos) ? usuariosInternos : [];

  const pedidosBrutos = data?.orders ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 0;

  // Filtro client-side por responsável (garante resultado correto mesmo se o backend filtrar mal)
  const pedidos = (() => {
    const rid = filtrosAplicados.responsavelId;
    if (!rid) return pedidosBrutos;
    if (rid === 'nenhum') {
      return pedidosBrutos.filter((p) => {
        const r = p.responsavelId;
        return r == null || r === '' || (typeof r === 'object' && !r._id);
      });
    }
    return pedidosBrutos.filter((p) => {
      const r = p.responsavelId;
      if (r == null) return false;
      const id = typeof r === 'object' ? r._id : r;
      return id && String(id) === String(rid);
    });
  })();

  const handleBuscar = useCallback(() => {
    const novos = { page: 1, limit: filtros.limit };
    if (filtros.status) novos.status = filtros.status;
    if (filtros.year) novos.year = Number(filtros.year);
    if (filtros.responsavelId) novos.responsavelId = filtros.responsavelId === 'nenhum' ? 'nenhum' : filtros.responsavelId;
    setFiltrosAplicados(novos);
  }, [filtros]);

  const handleLimpar = () => {
    setFiltros({ status: '', year: '', responsavelId: '', page: 1, limit: 20 });
    setFiltrosAplicados({ page: 1, limit: 20 });
  };

  const handlePageChange = (_, newPage) => {
    const updated = { ...filtrosAplicados, page: newPage + 1 };
    setFiltrosAplicados(updated);
  };

  const handleRowsPerPageChange = (e) => {
    const updated = { ...filtrosAplicados, limit: Number(e.target.value), page: 1 };
    setFiltrosAplicados(updated);
  };

  const handleExportar = async () => {
    setExportando(true);
    try {
      const filtrosExport = {};
      if (filtrosAplicados.status) filtrosExport.status = filtrosAplicados.status;
      if (filtrosAplicados.year) filtrosExport.year = filtrosAplicados.year;
      if (filtrosAplicados.responsavelId) filtrosExport.responsavelId = filtrosAplicados.responsavelId;
      await exportarPedidosIrAdmin(filtrosExport);
      toast.success('CSV exportado com sucesso!');
    } catch (err) {
      toast.error(err?.message || 'Erro ao exportar CSV.');
    } finally {
      setExportando(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 5 }}>
      <Stack spacing={3}>
        <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Box
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { md: 'center' },
              justifyContent: 'space-between',
              gap: 2,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
            }}
          >
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
                Imposto de Renda — Pedidos
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                {filtrosAplicados.responsavelId
                  ? `${pedidos.length} pedido(s) nesta página (filtro por responsável)`
                  : total > 0
                    ? `${total} pedido(s) encontrado(s)`
                    : 'Gerencie pedidos, status e acompanhamento da declaração.'}
              </Typography>
            </Box>
            <LoadingButton
              variant="outlined"
              startIcon={<Iconify icon="eva:download-outline" />}
              loading={exportando}
              onClick={handleExportar}
              sx={{ flexShrink: 0 }}
            >
              Exportar CSV
            </LoadingButton>
          </Box>
          {showResumoFinanceiro && (
            <CardContent
              sx={{
                pt: 0,
                px: { xs: 2, sm: 3 },
                pb: 3,
                borderTop: '1px solid',
                borderColor: 'divider',
                bgcolor: (t) => alpha(t.palette.grey[500], 0.04),
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2, mt: 0.5 }}>
                Valores somam todos os pedidos que correspondem aos filtros ativos (incluindo outras páginas da
                tabela, após <strong>Buscar</strong>).
              </Typography>
              <IrResumoFinanceiroCards
                loading={loadingResumo}
                error={errorResumo}
                data={resumoFinanceiro}
              />
            </CardContent>
          )}
        </Card>

        {/* Filtros */}
        <Card>
          <Box p={2}>
            <Grid container spacing={2} alignItems="flex-end">
              <Grid xs={12} sm={4} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filtros.status}
                    label="Status"
                    onChange={(e) => setFiltros((f) => ({ ...f, status: e.target.value }))}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    {Object.entries(IR_STATUS_LABELS).map(([value, label]) => (
                      <MenuItem key={value} value={value}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid xs={12} sm={4} md={2}>
                <TextField
                  label="Ano"
                  placeholder="2026"
                  type="number"
                  size="small"
                  fullWidth
                  value={filtros.year}
                  onChange={(e) => setFiltros((f) => ({ ...f, year: e.target.value }))}
                />
              </Grid>

              <Grid xs={12} sm={4} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Responsável</InputLabel>
                  <Select
                    value={filtros.responsavelId}
                    label="Responsável"
                    onChange={(e) => setFiltros((f) => ({ ...f, responsavelId: e.target.value }))}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="nenhum">Sem responsável</MenuItem>
                    {usuariosList.map((u) => (
                      <MenuItem key={u._id} value={u._id}>
                        {u.name || u.email || u._id}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid xs={12} sm={4} md={2}>
                <Stack direction="row" spacing={1}>
                  <Button variant="contained" onClick={handleBuscar} fullWidth>
                    Buscar
                  </Button>
                  <Button variant="outlined" onClick={handleLimpar}>
                    Limpar
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </Card>

        {/* Tabela */}
        <Card>
          {isLoading ? (
            <Box display="flex" justifyContent="center" py={6}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Cliente</TableCell>
                      <TableCell>Ano</TableCell>
                      <TableCell>Status</TableCell>
                      {showTipoPgtoValor && <TableCell>Tipo Pgto</TableCell>}
                      {showTipoPgtoValor && <TableCell>Valor</TableCell>}
                      <TableCell>Responsável</TableCell>
                      <TableCell>Criado em</TableCell>
                      <TableCell align="right">Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pedidos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6 + (showTipoPgtoValor ? 2 : 0)} align="center" sx={{ py: 6 }}>
                          <Typography color="text.secondary">
                            Nenhum pedido encontrado.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      pedidos.map((pedido) => {
                        const cliente = pedido.userId;
                        const {dadosComprador} = pedido;
                        const nome =
                          (typeof cliente === 'object' && (cliente?.name || `${cliente?.firstName ?? ''} ${cliente?.lastName ?? ''}`.trim())) ||
                          dadosComprador?.nome ||
                          '-';
                        const email = (typeof cliente === 'object' && cliente?.email) || dadosComprador?.email || '';

                        const responsavel = pedido.responsavelId;
                        const nomeResponsavel = typeof responsavel === 'object' ? (responsavel.name || responsavel.email || '—') : '—';

                        return (
                          <TableRow key={pedido._id} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight={500}>
                                {nome}
                              </Typography>
                              {email && (
                                <Typography variant="caption" color="text.secondary">
                                  {email}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{pedido.ano}</Typography>
                            </TableCell>
                            <TableCell>
                              <IrStatusBadge status={pedido.status} />
                            </TableCell>
                            {showTipoPgtoValor && (
                              <TableCell>
                                {(() => {
                                  const forma = FORMAS_PAGAMENTO.find((f) => f.value === pedido.paymentType);
                                  if (!forma) return <Typography variant="body2" color="text.secondary">—</Typography>;
                                  return (
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                      <Iconify icon={forma.icon} width={20} sx={{ color: 'primary.main' }} />
                                      <Typography variant="body2">{forma.label}</Typography>
                                    </Stack>
                                  );
                                })()}
                              </TableCell>
                            )}
                            {showTipoPgtoValor && (
                              <TableCell>
                                <Typography variant="body2">{fCurrency(pedido.valor)}</Typography>
                              </TableCell>
                            )}
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {nomeResponsavel}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {formatData(pedido.createdAt)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() =>
                                  router.push(paths.dashboard.impostoRenda.pedido(pedido._id))
                                }
                              >
                                Ver
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {totalPages > 1 && (
                <TablePagination
                  component="div"
                  count={total}
                  page={(filtrosAplicados.page ?? 1) - 1}
                  rowsPerPage={filtrosAplicados.limit ?? 20}
                  onPageChange={handlePageChange}
                  onRowsPerPageChange={handleRowsPerPageChange}
                  rowsPerPageOptions={[10, 20, 50]}
                  labelRowsPerPage="Por página:"
                  labelDisplayedRows={({ from, to, count }) =>
                    `${from}–${to} de ${count !== -1 ? count : `mais de ${to}`}`
                  }
                />
              )}
            </>
          )}
        </Card>
      </Stack>
    </Container>
  );
}
