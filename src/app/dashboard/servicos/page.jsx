'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableBody from '@mui/material/TableBody';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CardContent from '@mui/material/CardContent';
import Autocomplete from '@mui/material/Autocomplete';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';

import { fCurrency } from 'src/utils/format-number';

import { useGetAllClientes } from 'src/actions/clientes';
import { DashboardContent } from 'src/layouts/dashboard';
import { useServicosAdmin } from 'src/actions/servicos-admin';

import { Iconify } from 'src/components/iconify';
import { useTable, TableNoData, TableHeadCustom } from 'src/components/table';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'nome', label: 'Serviço' },
  { id: 'categoria', label: 'Categoria', width: 160 },
  { id: 'valor', label: 'Valor', width: 120 },
  { id: 'unidade', label: 'Unid.', width: 100 },
  { id: 'status', label: 'Status', width: 100 },
  { id: '', width: 88 },
];

// ----------------------------------------------------------------------

function ServicoTableRow({ row, onEdit }) {
  const isActive = row.status === true || row.status === 'true' || row.status === 1;

  return (
    <tr>
      <td style={{ padding: 16 }}>
        <Typography variant="subtitle2">{row.nome}</Typography>
        {row.descricao && (
          <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 300, display: 'block' }}>
            {row.descricao}
          </Typography>
        )}
      </td>
      <td style={{ padding: 16 }}>
        <Typography variant="body2">{row.categoria || '-'}</Typography>
      </td>
      <td style={{ padding: 16 }}>
        <Typography variant="body2" fontWeight={600}>
          {fCurrency(row.valor)}
        </Typography>
      </td>
      <td style={{ padding: 16 }}>
        <Typography variant="body2">{row.unidade || 'UN'}</Typography>
      </td>
      <td style={{ padding: 16 }}>
        <Box
          sx={{
            px: 1,
            py: 0.5,
            borderRadius: 0.75,
            typography: 'caption',
            fontWeight: 700,
            display: 'inline-flex',
            bgcolor: isActive ? 'success.lighter' : 'grey.300',
            color: isActive ? 'success.darker' : 'grey.700',
          }}
        >
          {isActive ? 'Ativo' : 'Inativo'}
        </Box>
      </td>
      <td style={{ padding: 16, textAlign: 'right' }}>
        <Tooltip title="Editar">
          <IconButton onClick={onEdit} color="primary">
            <Iconify icon="solar:pen-bold" />
          </IconButton>
        </Tooltip>
      </td>
    </tr>
  );
}

// ----------------------------------------------------------------------

export default function ServicosAdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const table = useTable({ defaultOrderBy: 'nome' });

  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    categoria: '',
  });

  const { data: clientes, isLoading: loadingClientes } = useGetAllClientes();
  const { data: servicos, isLoading: loadingServicos, mutate: mutateServicos } = useServicosAdmin(
    clienteSelecionado?._id || null,
    filters
  );

  const handleClienteChange = useCallback(
    (newValue) => {
      setClienteSelecionado(newValue);
      table.onResetPage();
      setFilters({ status: '', categoria: '' });
      
      // Força revalidação ao trocar de cliente
      if (newValue?._id) {
        mutateServicos();
      }
    },
    [table, mutateServicos]
  );

  const handleFilters = useCallback(
    (field, value) => {
      table.onResetPage();
      setFilters((prev) => ({ ...prev, [field]: value }));
    },
    [table]
  );

  const handleEditServico = (servicoId) => {
    if (!clienteSelecionado?._id) return;
    router.push(`${paths.dashboard.servicos}/${clienteSelecionado._id}/${servicoId}?returnClienteId=${clienteSelecionado._id}`);
  };

  const dataFiltered = Array.isArray(servicos) ? servicos : [];

  const isNotFound = !loadingServicos && (!clienteSelecionado || dataFiltered.length === 0);
  
  // Restaurar cliente selecionado ao voltar da edição
  useEffect(() => {
    const returnClienteId = searchParams.get('clienteId');
    if (returnClienteId && clientes && clientes.length > 0 && !clienteSelecionado) {
      const cliente = clientes.find((c) => c._id === returnClienteId);
      if (cliente) {
        setClienteSelecionado(cliente);
      }
    }
  }, [searchParams, clientes, clienteSelecionado]);

  return (
    <DashboardContent>
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <div>
            <Typography variant="h4" sx={{ mb: 0.5 }}>
              Gerenciar Serviços dos Clientes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Visualize e edite os serviços cadastrados pelos seus clientes
            </Typography>
          </div>
          {clienteSelecionado && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<Iconify icon="solar:add-circle-bold" />}
              onClick={() => router.push(`${paths.dashboard.servicos}/novo?clienteId=${clienteSelecionado._id}`)}
            >
              Novo Serviço
            </Button>
          )}
        </Stack>
      </Box>

      <Card>
        {/* Filtros */}
        <CardContent>
          <Stack spacing={2}>
            <Autocomplete
              fullWidth
              required
              options={Array.isArray(clientes) ? clientes : []}
              getOptionLabel={(option) => option.razaoSocial || option.nomeFantasia || option.email || ''}
              loading={loadingClientes}
              value={clienteSelecionado}
              onChange={(event, newValue) => {
                handleClienteChange(newValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  required
                  label="Selecione o Cliente/Empresa"
                  placeholder="Busque e selecione um cliente para ver seus serviços"
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
            />

            {clienteSelecionado && (
              <Stack spacing={2} direction={{ xs: 'column', md: 'row' }}>
                <TextField
                  select
                  fullWidth
                  label="Status"
                  value={filters.status}
                  onChange={(e) => handleFilters('status', e.target.value)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="true">Ativo</MenuItem>
                  <MenuItem value="false">Inativo</MenuItem>
                </TextField>

                {filters.status && (
                  <Button
                    variant="outlined"
                    color="inherit"
                    startIcon={<Iconify icon="solar:restart-bold" />}
                    onClick={() => setFilters({ status: '', categoria: '' })}
                    sx={{ minWidth: 140 }}
                  >
                    Limpar Filtros
                  </Button>
                )}
              </Stack>
            )}
          </Stack>
        </CardContent>

        {/* Tabela */}
        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Table size={table.dense ? 'small' : 'medium'}>
            <TableHeadCustom
              order={table.order}
              orderBy={table.orderBy}
              headLabel={TABLE_HEAD}
              onSort={table.onSort}
            />

            <TableBody>
              {loadingServicos ? (
                [...Array(5)].map((_, index) => (
                  <tr key={index}>
                    <td colSpan={6} style={{ padding: 16 }}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <CircularProgress size={20} />
                        <Typography variant="body2" color="text.secondary">
                          Carregando...
                        </Typography>
                      </Stack>
                    </td>
                  </tr>
                ))
              ) : (
                <>
                  {dataFiltered
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row) => (
                      <ServicoTableRow
                        key={row._id}
                        row={row}
                        onEdit={() => handleEditServico(row._id)}
                      />
                    ))}
                </>
              )}
            </TableBody>

            {!clienteSelecionado && (
              <tr>
                <td colSpan={6} style={{ padding: 16, textAlign: 'center' }}>
                  <Stack spacing={1} alignItems="center">
                    <Iconify icon="solar:user-search-bold-duotone" width={64} sx={{ color: 'text.disabled' }} />
                    <Typography variant="h6" color="text.secondary">
                      Selecione um cliente
                    </Typography>
                    <Typography variant="body2" color="text.disabled">
                      Escolha um cliente acima para visualizar seus serviços
                    </Typography>
                  </Stack>
                </td>
              </tr>
            )}
            {clienteSelecionado && isNotFound && <TableNoData notFound={isNotFound} />}
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={dataFiltered.length}
          rowsPerPage={table.rowsPerPage}
          page={table.page}
          onPageChange={table.onChangePage}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>
    </DashboardContent>
  );
}

