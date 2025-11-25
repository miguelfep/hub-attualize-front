'use client';

import { useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Paper from '@mui/material/Paper';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import InputAdornment from '@mui/material/InputAdornment';
import LinearProgress from '@mui/material/LinearProgress';
import TablePagination from '@mui/material/TablePagination';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

const categoriaOptions = [
  'Não classificado',
  'Receita recorrente',
  'Honorários',
  'Transferências',
  'Impostos e taxas',
  'Operacional',
  'Outros',
];

const statusOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'conciliado', label: 'Conciliados' },
  { value: 'pendente', label: 'Pendentes' },
];

const tipoOptions = [
  { value: 'all', label: 'Todos os tipos' },
  { value: 'entrada', label: 'Entradas' },
  { value: 'saida', label: 'Saídas' },
];

export function BankStatementTable({
  transactions,
  totalCount,
  loading,
  filters,
  onFiltersChange,
  onToggleConciliado,
  onCategoriaChange,
}) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    setPage(0);
  }, [filters]);

  useEffect(() => {
    if (page * rowsPerPage >= transactions.length && page > 0) {
      setPage(0);
    }
  }, [transactions.length, page, rowsPerPage]);

  const paginated = useMemo(() => {
    const start = page * rowsPerPage;
    return transactions.slice(start, start + rowsPerPage);
  }, [transactions, page, rowsPerPage]);

  const handleFilterChange = (field) => (event) => {
    const {value} = event.target;
    onFiltersChange({ ...filters, [field]: value });
  };

  const handleSearchChange = (event) => {
    onFiltersChange({ ...filters, search: event.target.value });
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value ?? 0);

  const formatDate = (value) => {
    if (!value) return '—';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }
    return parsed.toLocaleDateString('pt-BR');
  };

  return (
    <Card>
      {loading && <LinearProgress />}

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{ px: 3, pt: 3, pb: 2 }}
        alignItems={{ xs: 'stretch', md: 'center' }}
      >
        <TextField
          fullWidth
          value={filters.search}
          onChange={handleSearchChange}
          placeholder="Buscar por descrição, arquivo ou valor"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="solar:magnifer-bold" />
              </InputAdornment>
            ),
          }}
        />
        <TextField select label="Status" value={filters.status} onChange={handleFilterChange('status')} sx={{ minWidth: 180 }}>
          {statusOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField select label="Tipo" value={filters.tipo} onChange={handleFilterChange('tipo')} sx={{ minWidth: 180 }}>
          {tipoOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <Scrollbar>
        <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell align="right">Valor</TableCell>
                <TableCell>Categoria</TableCell>
                <TableCell align="center">Arquivo</TableCell>
                <TableCell align="center">Conciliação</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map((transaction) => (
                <TableRow key={transaction.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {formatDate(transaction.date)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {transaction.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">{transaction.description}</Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                      <Chip
                        size="small"
                        label={transaction.sourceFile?.format?.toUpperCase() ?? 'API'}
                        variant="outlined"
                      />
                      {transaction.sourceFile?.name && (
                        <Tooltip
                          title={`${transaction.sourceFile.name} (${formatBytes(transaction.sourceFile.size)})`}
                          arrow
                        >
                          <Chip size="small" label={transaction.sourceFile.name} />
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle2" color={transaction.amount >= 0 ? 'success.main' : 'error.main'}>
                      {formatCurrency(transaction.amount)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <TextField
                      select
                      size="small"
                      value={transaction.categoria || 'Não classificado'}
                      onChange={(event) => onCategoriaChange(transaction, event.target.value)}
                      sx={{ minWidth: 180 }}
                    >
                      {categoriaOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </TextField>
                  </TableCell>
                  <TableCell align="center">
                    {transaction.sourceFile?.name ? (
                      <Typography variant="caption" color="text.secondary">
                        Lote {transaction.batchId?.slice(0, 8) ?? '-'}
                      </Typography>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        —
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                      <Chip
                        size="small"
                        color={transaction.conciliado ? 'success' : 'default'}
                        label={transaction.conciliado ? 'Conciliado' : 'Pendente'}
                      />
                      <Switch
                        checked={transaction.conciliado}
                        onChange={() => onToggleConciliado(transaction)}
                        inputProps={{ 'aria-label': 'Alternar conciliação' }}
                      />
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}

              {!paginated.length && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      {loading
                        ? 'Carregando lançamentos...'
                        : 'Nenhum lançamento encontrado para os filtros selecionados.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Scrollbar>

      <TablePagination
        component="div"
        count={transactions.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[10, 25, 50]}
        labelRowsPerPage="Linhas por página"
      />

      <Box sx={{ px: 3, pb: 3 }}>
        <Typography variant="caption" color="text.secondary">
          Mostrando {paginated.length} de {transactions.length} lançamentos filtrados (total importado: {totalCount})
        </Typography>
      </Box>
    </Card>
  );
}

function formatBytes(value) {
  if (!value) {
    return '0 B';
  }
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.floor(Math.log(value) / Math.log(1024));
  const size = value / 1024 ** index;
  return `${size.toFixed(1)} ${units[index]}`;
}
