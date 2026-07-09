'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';

import { LoadingButton } from '@mui/lab';
import Grid from '@mui/material/Unstable_Grid2';
import {
  Box,
  Card,
  Table,
  Stack,
  Button,
  Dialog,
  Select,
  Tooltip,
  Skeleton,
  MenuItem,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  InputLabel,
  Pagination,
  IconButton,
  Typography,
  FormControl,
  DialogTitle,
  Autocomplete,
  DialogContent,
  DialogActions,
  TableContainer,
} from '@mui/material';

import { paths } from 'src/routes/paths';

import { fDateTime } from 'src/utils/format-time';
import { formatClienteCodigoRazao } from 'src/utils/formatter';

import { getClientes } from 'src/actions/clientes';
import { DashboardContent } from 'src/layouts/dashboard';
import { deletarDiagnostico, useGetDiagnosticos } from 'src/actions/reforma-tributaria-diagnostico';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useAuthContext } from 'src/auth/hooks';

import { DiagnosticoNovoDialog } from '../components/diagnostico-novo-dialog';
import {
  getStatusOption,
  formatCompetencia,
  getRecomendacaoLabel,
  getRecomendacaoColor,
  DIAGNOSTICO_STATUS_OPTIONS,
} from '../utils';

// ----------------------------------------------------------------------

const LIMIT = 20;

const ROLES_DELETAR = ['admin', 'operacional', 'gerencial'];

export function DiagnosticoListView() {
  const router = useRouter();
  const { user } = useAuthContext();
  const podeDeletar = ROLES_DELETAR.includes(user?.role);

  const [clientes, setClientes] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [clienteFiltro, setClienteFiltro] = useState(null);
  const [statusFiltro, setStatusFiltro] = useState('');
  const [page, setPage] = useState(1);
  const [openNovo, setOpenNovo] = useState(false);
  const [deleteAlvo, setDeleteAlvo] = useState(null);
  const [deletando, setDeletando] = useState(false);

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const res = await getClientes({ status: true, tipoContato: 'cliente' });
        if (ativo) setClientes(Array.isArray(res) ? res : res?.clientes || []);
      } catch {
        if (ativo) setClientes([]);
        toast.error('Erro ao carregar clientes');
      } finally {
        if (ativo) setLoadingClientes(false);
      }
    })();
    return () => {
      ativo = false;
    };
  }, []);

  const { diagnosticos, total, diagnosticosLoading, refetchDiagnosticos } = useGetDiagnosticos({
    status: statusFiltro || undefined,
    clienteId: clienteFiltro?._id || undefined,
    page,
    limit: LIMIT,
  });

  const totalPages = Math.max(1, Math.ceil((total || 0) / LIMIT));

  const clientesById = useMemo(() => {
    const map = {};
    clientes.forEach((cliente) => {
      map[cliente._id || cliente.id] = cliente;
    });
    return map;
  }, [clientes]);

  // clienteId pode vir populado do backend; senão resolve pelo cache local de clientes.
  const clienteLabel = (diagnostico) => {
    const cliente = diagnostico?.cliente || diagnostico?.clienteId;
    if (cliente && typeof cliente === 'object') return formatClienteCodigoRazao(cliente);
    const local = clientesById[cliente];
    return local ? formatClienteCodigoRazao(local) : cliente || '—';
  };

  const handleCreated = (id) => {
    refetchDiagnosticos();
    if (id) router.push(paths.dashboard.fiscal.reformaTributaria.details(id));
  };

  const handleDeletar = async () => {
    if (!deleteAlvo) return;
    try {
      setDeletando(true);
      await deletarDiagnostico(deleteAlvo._id || deleteAlvo.id);
      toast.success('Diagnóstico excluído');
      setDeleteAlvo(null);
      refetchDiagnosticos();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Erro ao excluir diagnóstico');
    } finally {
      setDeletando(false);
    }
  };

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Reforma Tributária — Diagnóstico"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Fiscal', href: paths.dashboard.fiscal.root },
          { name: 'Reforma Tributária' },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => setOpenNovo(true)}
          >
            Novo diagnóstico
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <Box sx={{ p: 2.5 }}>
          <Grid container spacing={2}>
            <Grid xs={12} md={6}>
              <Autocomplete
                fullWidth
                options={clientes}
                loading={loadingClientes}
                getOptionLabel={(option) => formatClienteCodigoRazao(option)}
                isOptionEqualToValue={(opt, val) => (opt?._id || opt?.id) === (val?._id || val?.id)}
                value={clienteFiltro}
                onChange={(_, newValue) => {
                  setClienteFiltro(newValue);
                  setPage(1);
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Cliente" placeholder="Todos os clientes" />
                )}
              />
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={statusFiltro}
                  onChange={(e) => {
                    setStatusFiltro(e.target.value);
                    setPage(1);
                  }}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {DIAGNOSTICO_STATUS_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 720 }}>
            <TableHead>
              <TableRow>
                <TableCell>Cliente</TableCell>
                <TableCell>Competência</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Recomendação</TableCell>
                <TableCell>Atualizado em</TableCell>
                <TableCell align="right" />
              </TableRow>
            </TableHead>
            <TableBody>
              {diagnosticosLoading &&
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    {Array.from({ length: 6 }).map((__, cellIndex) => (
                      <TableCell key={cellIndex}>
                        <Skeleton variant="text" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}

              {!diagnosticosLoading && diagnosticos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Stack alignItems="center" sx={{ py: 6 }}>
                      <Typography variant="subtitle1" color="text.secondary">
                        Nenhum diagnóstico encontrado
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Crie um novo diagnóstico para começar o comparativo.
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              )}

              {!diagnosticosLoading &&
                diagnosticos.map((diagnostico) => {
                  const id = diagnostico._id || diagnostico.id;
                  const statusOption = getStatusOption(diagnostico.status);
                  const recomendacao = diagnostico.resultado?.comparativo?.recomendacaoFinal;
                  return (
                    <TableRow
                      key={id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => router.push(paths.dashboard.fiscal.reformaTributaria.details(id))}
                    >
                      <TableCell>
                        <Typography variant="subtitle2">{clienteLabel(diagnostico)}</Typography>
                      </TableCell>
                      <TableCell>{formatCompetencia(diagnostico.competenciaBase)}</TableCell>
                      <TableCell>
                        <Label color={statusOption.color} variant="soft">
                          {statusOption.label}
                        </Label>
                      </TableCell>
                      <TableCell>
                        {recomendacao ? (
                          <Label color={getRecomendacaoColor(recomendacao)} variant="soft">
                            {getRecomendacaoLabel(recomendacao)}
                          </Label>
                        ) : (
                          <Typography variant="body2" color="text.disabled">
                            Não calculado
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{diagnostico.updatedAt ? fDateTime(diagnostico.updatedAt) : '—'}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end" alignItems="center">
                          {podeDeletar && (
                            <Tooltip title="Excluir diagnóstico">
                              <IconButton
                                color="error"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setDeleteAlvo(diagnostico);
                                }}
                              >
                                <Iconify icon="solar:trash-bin-trash-bold" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Iconify icon="eva:arrow-ios-forward-fill" sx={{ color: 'text.disabled' }} />
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>

        {totalPages > 1 && (
          <Stack alignItems="center" sx={{ py: 2 }}>
            <Pagination count={totalPages} page={page} onChange={(_, value) => setPage(value)} />
          </Stack>
        )}
      </Card>

      <DiagnosticoNovoDialog open={openNovo} onClose={() => setOpenNovo(false)} onCreated={handleCreated} />

      <Dialog open={!!deleteAlvo} onClose={() => !deletando && setDeleteAlvo(null)} fullWidth maxWidth="xs">
        <DialogTitle>Excluir diagnóstico</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Tem certeza que deseja excluir o diagnóstico de{' '}
            <strong>{deleteAlvo ? clienteLabel(deleteAlvo) : ''}</strong> (
            {formatCompetencia(deleteAlvo?.competenciaBase)})? Essa ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" disabled={deletando} onClick={() => setDeleteAlvo(null)}>
            Cancelar
          </Button>
          <LoadingButton variant="contained" color="error" loading={deletando} onClick={handleDeletar}>
            Excluir
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
