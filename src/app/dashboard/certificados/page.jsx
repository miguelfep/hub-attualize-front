'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';

import Grid from '@mui/material/Unstable_Grid2';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  Card,
  Chip,
  Stack,
  Table,
  Button,
  Switch,
  MenuItem,
  TableRow,
  TableBody,
  TableCell,
  TextField,
  Typography,
  Autocomplete,
  TableContainer,
  CircularProgress,
  FormControlLabel,
} from '@mui/material';

import { formatClienteCodigoRazao } from 'src/utils/formatter';

import { useGetAllClientes } from 'src/actions/clientes';
import { listarCertificados, getCorStatusCertificado, getIconeStatusCertificado } from 'src/actions/certificados';

import { Iconify } from 'src/components/iconify';
import { useTable, TableNoData, TableHeadCustom, TablePaginationCustom } from 'src/components/table';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'cliente', label: 'Cliente' },
  { id: 'cnpj', label: 'CNPJ' },
  { id: 'status', label: 'Status', width: 140 },
  { id: 'validTo', label: 'Validade', width: 120 },
  { id: 'situacao', label: 'Situação', width: 140 },
  { id: 'uploadedAt', label: 'Enviado em', width: 160 },
];

function rowKey(row, index) {
  const id = row?._id ?? row?.id;
  if (id != null && id !== '') return String(id);
  return `cert-row-${index}`;
}

// ----------------------------------------------------------------------

export default function CertificadosPage() {
  const theme = useTheme();
  const { user } = useAuthContext();

  const table = useTable({ defaultRowsPerPage: 20, defaultOrderBy: 'validTo', defaultOrder: 'desc' });

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);

  const [status, setStatus] = useState('');
  const [vencidos, setVencidos] = useState(false);
  const [expiraEmDias, setExpiraEmDias] = useState('');
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [sortBy, setSortBy] = useState('validTo');
  const [sortOrder, setSortOrder] = useState('desc');

  const { data: clientesData, isLoading: loadingClientes } = useGetAllClientes({ status: true });
  const clientes = Array.isArray(clientesData) ? clientesData : [];

  const canView = useMemo(() => Boolean(user), [user]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: table.page + 1,
        limit: table.rowsPerPage,
        sortBy,
        sortOrder,
      };
      if (status) params.status = status;
      if (vencidos) params.vencidos = true;
      if (expiraEmDias) params.expiraEmDias = Number(expiraEmDias);
      if (clienteSelecionado?._id) params.clienteId = clienteSelecionado._id;

      const { data } = await listarCertificados(params);
      setRows(data?.data || []);
      setTotal(data?.total || 0);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [
    table.page,
    table.rowsPerPage,
    status,
    vencidos,
    expiraEmDias,
    clienteSelecionado,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    if (canView) fetchData();
  }, [canView, fetchData]);

  const handleLimparFiltros = useCallback(() => {
    setStatus('');
    setVencidos(false);
    setExpiraEmDias('');
    setClienteSelecionado(null);
    setSortBy('validTo');
    setSortOrder('desc');
    table.onResetPage();
  }, [table]);

  const handleClienteChange = useCallback(
    (_event, newValue) => {
      setClienteSelecionado(newValue);
      table.onResetPage();
    },
    [table]
  );

  const notFound = !loading && rows.length === 0;

  return (
    <Box>
      <Card sx={{ borderRadius: 3, mb: 2 }}>
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
              Certificados
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Controle centralizado de certificados digitais: busque, filtre e acompanhe vencimentos.
            </Typography>
          </Box>
        </Box>
      </Card>

      <Card sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                table.onResetPage();
              }}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="ativo">Ativo</MenuItem>
              <MenuItem value="inativo">Inativo</MenuItem>
              <MenuItem value="expirado">Expirado</MenuItem>
              <MenuItem value="erro">Erro</MenuItem>
            </TextField>
          </Grid>
          <Grid xs={12} md={3}>
            <TextField
              fullWidth
              type="number"
              label="Expira em (dias)"
              value={expiraEmDias}
              onChange={(e) => {
                setExpiraEmDias(e.target.value);
                table.onResetPage();
              }}
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid xs={12} md={4}>
            <Autocomplete
              fullWidth
              options={clientes}
              loading={loadingClientes}
              getOptionLabel={(option) => formatClienteCodigoRazao(option)}
              isOptionEqualToValue={(option, value) =>
                String(option._id || option.id) === String(value?._id || value?.id)
              }
              value={clienteSelecionado}
              onChange={handleClienteChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Cliente"
                  placeholder="Todos os clientes"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingClientes ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              ListboxProps={{ sx: { maxHeight: 280 } }}
            />
          </Grid>
          <Grid xs={12} md={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={vencidos}
                  onChange={(e) => {
                    setVencidos(e.target.checked);
                    table.onResetPage();
                  }}
                />
              }
              label="Vencidos"
            />
          </Grid>
          <Grid xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Ordenar por"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="validTo">Validade</MenuItem>
              <MenuItem value="uploadedAt">Upload</MenuItem>
              <MenuItem value="status">Status</MenuItem>
            </TextField>
          </Grid>
          <Grid xs={12} md={3}>
            <TextField select fullWidth label="Ordem" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <MenuItem value="asc">Asc</MenuItem>
              <MenuItem value="desc">Desc</MenuItem>
            </TextField>
          </Grid>
          <Grid xs={12} md={6}>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button variant="outlined" onClick={handleLimparFiltros}>
                Limpar filtros
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  table.onResetPage();
                  fetchData();
                }}
                startIcon={<Iconify icon="eva:refresh-fill" />}
              >
                Atualizar
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Card>

      <Card sx={{ p: 0 }}>
        <TableContainer sx={{ position: 'relative', overflow: 'auto' }}>
          <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 720 }}>
            <TableHeadCustom headLabel={TABLE_HEAD} />

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={2}>
                      <CircularProgress size={24} />
                      <Typography variant="body2" color="text.secondary">
                        Carregando certificados…
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : notFound ? (
                <TableNoData notFound />
              ) : (
                rows.map((row, index) => {
                  const statusColor = getCorStatusCertificado(row.status);
                  const statusIcon = getIconeStatusCertificado(row.status);
                  const validade = row.validTo ? new Date(row.validTo).toLocaleDateString('pt-BR') : '-';
                  const uploadedAt = row.uploadedAt ? new Date(row.uploadedAt).toLocaleString('pt-BR') : '-';
                  const situacao = row.isExpired
                    ? 'Vencido'
                    : typeof row.daysToExpire === 'number'
                      ? `Em ${row.daysToExpire} dias`
                      : '-';

                  return (
                    <TableRow key={rowKey(row, index)} hover>
                      <TableCell>{row?.cliente?.razaoSocial || row?.cliente?.nome || '-'}</TableCell>
                      <TableCell>{row?.cliente?.cnpj || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          color={statusColor}
                          variant="soft"
                          size="small"
                          icon={<Iconify icon={statusIcon} />}
                          label={row.status}
                        />
                      </TableCell>
                      <TableCell>{validade}</TableCell>
                      <TableCell>{situacao}</TableCell>
                      <TableCell>{uploadedAt}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePaginationCustom
          count={total}
          page={table.page}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onRowsPerPageChange={table.onChangeRowsPerPage}
          rowsPerPageOptions={[10, 20, 50]}
        />
      </Card>
    </Box>
  );
}


