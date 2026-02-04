'use client';

import { useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import { Iconify } from 'src/components/iconify';
import { CustomDateRangePicker } from 'src/components/custom-date-range-picker';

// ----------------------------------------------------------------------

export function GuiaFiscalTableToolbar({
  filters,
  onFilters,
  onFilterCliente,
  onFilterStatus,
  onFilterTipoGuia,
  onFilterCategoria,
  onResetFilters,
  canReset,
  tipoGuiaOptions,
  categoriaOptions,
  clientes = [],
  loadingClientes = false,
  numSelected = 0,
  onDeleteBatch,
}) {
  const handleFilterCliente = useCallback(
    (event) => {
      const clienteId = event.target.value || '';
      // Se tiver callback específico para cliente, usar ele (que reseta a página)
      if (onFilterCliente) {
        onFilterCliente(clienteId);
      } else {
        // Caso contrário, usar o onFilters genérico
        onFilters('clienteId', clienteId);
      }
    },
    [onFilters, onFilterCliente]
  );

  const handleFilterTipoGuia = useCallback(
    (event) => {
      const {value} = event.target;
      if (onFilterTipoGuia) {
        onFilterTipoGuia(event);
      } else {
        onFilters('tipoGuia', value);
      }
    },
    [onFilters, onFilterTipoGuia]
  );

  const handleFilterCategoria = useCallback(
    (event) => {
      const {value} = event.target;
      if (onFilterCategoria) {
        onFilterCategoria(event);
      } else {
        onFilters('categoria', value);
      }
    },
    [onFilters, onFilterCategoria]
  );

  const handleFilterStatus = useCallback(
    (event) => {
      const {value} = event.target;
      if (onFilterStatus) {
        onFilterStatus(event);
      } else {
        onFilters('status', value);
      }
    },
    [onFilters, onFilterStatus]
  );

  const handleFilterDateRange = useCallback(
    (dateRange) => {
      onFilters('dataInicio', dateRange[0]);
      onFilters('dataFim', dateRange[1]);
    },
    [onFilters]
  );

  return (
    <Stack
      spacing={2}
      alignItems={{ xs: 'flex-end', md: 'center' }}
      direction={{ xs: 'column', md: 'row' }}
      sx={{ p: 2.5, pr: { xs: 2.5, md: 1 } }}
    >
      <TextField
        fullWidth
        select
        label="Cliente"
        value={filters.clienteId || ''}
        onChange={handleFilterCliente}
        disabled={loadingClientes}
        sx={{ maxWidth: { md: 320 } }}
      >
        <MenuItem value="">
          <em>Todos os clientes</em>
        </MenuItem>
        {clientes.map((cliente) => (
          <MenuItem key={cliente._id || cliente.id} value={cliente._id || cliente.id}>
            {cliente.name || cliente.razaoSocial || cliente.nome}
          </MenuItem>
        ))}
      </TextField>

      {categoriaOptions && (
        <TextField
          fullWidth
          select
          label="Categoria"
          value={filters.categoria || 'all'}
          onChange={handleFilterCategoria}
          sx={{ maxWidth: { md: 160 } }}
        >
          {categoriaOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      )}

      <TextField
        fullWidth
        select
        label="Tipo"
        value={filters.tipoGuia}
        onChange={handleFilterTipoGuia}
        sx={{ maxWidth: { md: 200 } }}
      >
        {tipoGuiaOptions.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        fullWidth
        select
        label="Status"
        value={filters.status}
        onChange={handleFilterStatus}
        sx={{ maxWidth: { md: 160 } }}
      >
        <MenuItem value="all">Todos</MenuItem>
        <MenuItem value="pendente">Pendente</MenuItem>
        <MenuItem value="processado">Processado</MenuItem>
        <MenuItem value="erro">Erro</MenuItem>
      </TextField>

      <CustomDateRangePicker
        startDate={filters.dataInicio}
        endDate={filters.dataFim}
        onChangeDateRange={handleFilterDateRange}
      />

      {numSelected > 0 && onDeleteBatch && (
        <Button
          color="error"
          variant="contained"
          onClick={onDeleteBatch}
          startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
        >
          Deletar ({numSelected})
        </Button>
      )}

      {canReset && (
        <Button
          color="error"
          onClick={onResetFilters}
          startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
        >
          Limpar
        </Button>
      )}
    </Stack>
  );
}
