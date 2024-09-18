import dayjs from 'dayjs';
import { useCallback } from 'react';

import Chip from '@mui/material/Chip';

import { chipProps, FiltersBlock, FiltersResult } from 'src/components/filters-result';

// ----------------------------------------------------------------------

export function ReceberTableFiltersResult({ filters, setFilters, totalResults, onResetPage, sx }) {
  // Função para remover o filtro de descrição
  const handleRemoveDescricao = useCallback(() => {
    onResetPage();
    setFilters((prev) => ({ ...prev, descricao: '' }));
  }, [setFilters, onResetPage]);

  // Função para remover o filtro de status
  const handleRemoveStatus = useCallback(() => {
    onResetPage();
    setFilters((prev) => ({ ...prev, status: 'all' }));
  }, [setFilters, onResetPage]);

  // Função para resetar todos os filtros
  const handleReset = useCallback(() => {
    onResetPage();
    setFilters({
      descricao: '',
      status: 'all',
      startDate: dayjs().startOf('month'), // Opcional, se quiser resetar também as datas
      endDate: dayjs().endOf('month'), // Opcional, se quiser resetar também as datas
    });
  }, [setFilters, onResetPage]);

  return (
    <FiltersResult totalResults={totalResults} onReset={handleReset} sx={sx}>
      {/* Filtro de Status */}
      <FiltersBlock label="Status:" isShow={filters.status !== 'all'}>
        <Chip
          {...chipProps}
          label={filters.status || 'all'}
          onDelete={handleRemoveStatus}
          sx={{ textTransform: 'capitalize' }}
        />
      </FiltersBlock>

      {/* Filtro de Descrição */}
      <FiltersBlock label="Descrição:" isShow={!!filters.descricao}>
        <Chip {...chipProps} label={filters.descricao || ''} onDelete={handleRemoveDescricao} />
      </FiltersBlock>
    </FiltersResult>
  );
}
