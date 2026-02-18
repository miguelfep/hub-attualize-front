'use client';

import { useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const TIPO_ACESSO_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'gratuito', label: 'Gratuito' },
  { value: 'exclusivo_cliente', label: 'Exclusivo Cliente' },
  { value: 'pago', label: 'Pago' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'ativo', label: 'Ativo' },
  { value: 'inativo', label: 'Inativo' },
  { value: 'rascunho', label: 'Rascunho' },
];

// ----------------------------------------------------------------------

export function CursoTableToolbar({ filters, onFilters, onResetFilters, canReset }) {
  const handleFilterBusca = useCallback(
    (event) => {
      onFilters({ ...filters, busca: event.target.value });
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

      <TextField
        fullWidth
        select
        label="Acesso"
        value={filters.tipoAcesso || 'all'}
        onChange={handleFilterTipoAcesso}
        sx={{ maxWidth: { md: 160 } }}
      >
        {TIPO_ACESSO_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        fullWidth
        select
        label="Status"
        value={filters.status || 'all'}
        onChange={handleFilterStatus}
        sx={{ maxWidth: { md: 160 } }}
      >
        {STATUS_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>

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
