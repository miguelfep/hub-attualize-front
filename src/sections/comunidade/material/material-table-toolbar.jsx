'use client';

import { useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function MaterialTableToolbar({
  filters,
  onFilters,
  onResetFilters,
  tipoOptions,
  tipoAcessoOptions,
  statusOptions,
  canReset,
}) {
  const handleFilterBusca = useCallback(
    (event) => {
      onFilters({ ...filters, busca: event.target.value });
    },
    [filters, onFilters]
  );

  const handleFilterTipo = useCallback(
    (event) => {
      onFilters({ ...filters, tipo: event.target.value });
    },
    [filters, onFilters]
  );

  const handleFilterTipoAcesso = useCallback(
    (event) => {
      onFilters({ ...filters, tipoAcesso: event.target.value });
    },
    [filters, onFilters]
  );

  const handleFilterStatus = useCallback(
    (event) => {
      onFilters({ ...filters, status: event.target.value });
    },
    [filters, onFilters]
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
        value={filters.busca || ''}
        onChange={handleFilterBusca}
        placeholder="Buscar por título ou descrição..."
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
        }}
        sx={{ maxWidth: { md: 320 } }}
      />

      {tipoOptions && (
        <TextField
          fullWidth
          select
          label="Tipo"
          value={filters.tipo || 'all'}
          onChange={handleFilterTipo}
          sx={{ maxWidth: { md: 160 } }}
        >
          {tipoOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      )}

      {tipoAcessoOptions && (
        <TextField
          fullWidth
          select
          label="Acesso"
          value={filters.tipoAcesso || 'all'}
          onChange={handleFilterTipoAcesso}
          sx={{ maxWidth: { md: 160 } }}
        >
          {tipoAcessoOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      )}

      {statusOptions && (
        <TextField
          fullWidth
          select
          label="Status"
          value={filters.status || 'all'}
          onChange={handleFilterStatus}
          sx={{ maxWidth: { md: 160 } }}
        >
          {statusOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
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
