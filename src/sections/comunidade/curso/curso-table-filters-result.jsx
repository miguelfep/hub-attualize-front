'use client';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function CursoTableFiltersResult({ filters, onFilters, onResetFilters, results }) {
  const handleRemoveTipoAcesso = () => {
    onFilters({ ...filters, tipoAcesso: 'all' });
  };

  const handleRemoveStatus = () => {
    onFilters({ ...filters, status: 'all' });
  };

  const handleRemoveBusca = () => {
    onFilters({ ...filters, busca: '' });
  };

  return (
    <Stack spacing={1.5} direction="row" flexWrap="wrap" alignItems="center">
      {!!results && (
        <Chip
          label={`${results} resultado${results > 1 ? 's' : ''}`}
          size="small"
          color="primary"
          variant="soft"
        />
      )}

      {filters.busca && (
        <Chip
          label={`Busca: ${filters.busca}`}
          size="small"
          onDelete={handleRemoveBusca}
        />
      )}

      {filters.tipoAcesso !== 'all' && (
        <Chip
          label={`Acesso: ${filters.tipoAcesso}`}
          size="small"
          onDelete={handleRemoveTipoAcesso}
        />
      )}

      {filters.status !== 'all' && (
        <Chip
          label={`Status: ${filters.status}`}
          size="small"
          onDelete={handleRemoveStatus}
        />
      )}

      <Button
        color="error"
        onClick={onResetFilters}
        startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
      >
        Limpar
      </Button>
    </Stack>
  );
}
