'use client';

import { useCallback } from 'react';

import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import { fDate } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function GuiaFiscalTableFiltersResult({
  filters,
  onFilters,
  onResetFilters,
  results,
  tipoGuiaOptions,
  statusOptions,
  categoriaOptions,
  clientes = [],
}) {
  const handleRemoveStatus = useCallback(() => {
    onFilters({ ...filters, status: 'all' });
  }, [filters, onFilters]);

  const handleRemoveTipoGuia = useCallback(() => {
    onFilters({ ...filters, tipoGuia: 'all' });
  }, [filters, onFilters]);

  const handleRemoveCategoria = useCallback(() => {
    onFilters({ ...filters, categoria: 'all' });
  }, [filters, onFilters]);

  const handleRemoveCliente = useCallback(() => {
    onFilters({ ...filters, clienteId: '' });
  }, [filters, onFilters]);

  const handleRemoveDateRange = useCallback(() => {
    onFilters({ ...filters, dataInicio: null, dataFim: null });
  }, [filters, onFilters]);

  return (
    <Stack spacing={1.5} sx={{ p: 2.5 }}>
      <Stack flexWrap="wrap" direction="row" spacing={1}>
        {!!filters.clienteId && (
          <Chip
            label={`Cliente: ${
              clientes.find((c) => (c._id || c.id) === filters.clienteId)?.name ||
              clientes.find((c) => (c._id || c.id) === filters.clienteId)?.razaoSocial ||
              clientes.find((c) => (c._id || c.id) === filters.clienteId)?.nome ||
              filters.clienteId
            }`}
            onDelete={handleRemoveCliente}
            deleteIcon={<Iconify icon="solar:close-circle-bold" />}
          />
        )}

        {filters.categoria && filters.categoria !== 'all' && (
          <Chip
            label={`Categoria: ${
              categoriaOptions?.find((opt) => opt.value === filters.categoria)?.label || filters.categoria
            }`}
            onDelete={handleRemoveCategoria}
            deleteIcon={<Iconify icon="solar:close-circle-bold" />}
          />
        )}

        {filters.tipoGuia !== 'all' && (
          <Chip
            label={`Tipo: ${
              tipoGuiaOptions.find((opt) => opt.value === filters.tipoGuia)?.label || filters.tipoGuia
            }`}
            onDelete={handleRemoveTipoGuia}
            deleteIcon={<Iconify icon="solar:close-circle-bold" />}
          />
        )}

        {filters.status !== 'all' && (
          <Chip
            label={`Status: ${
              statusOptions.find((opt) => opt.value === filters.status)?.label || filters.status
            }`}
            onDelete={handleRemoveStatus}
            deleteIcon={<Iconify icon="solar:close-circle-bold" />}
          />
        )}

        {(!!filters.dataInicio || !!filters.dataFim) && (
          <Chip
            label={`Data: ${
              filters.dataInicio && filters.dataFim
                ? `${fDate(filters.dataInicio)} - ${fDate(filters.dataFim)}`
                : filters.dataInicio
                  ? `A partir de ${fDate(filters.dataInicio)}`
                  : `Até ${fDate(filters.dataFim)}`
            }`}
            onDelete={handleRemoveDateRange}
            deleteIcon={<Iconify icon="solar:close-circle-bold" />}
          />
        )}
      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ typography: 'body2' }}>
        <strong>{results}</strong> resultado(s) encontrado(s)

        <Button color="error" onClick={onResetFilters} startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}>
          Limpar tudo
        </Button>
      </Stack>
    </Stack>
  );
}
