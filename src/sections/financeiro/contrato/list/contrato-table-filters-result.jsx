import { useCallback } from 'react';

import Chip from '@mui/material/Chip';

import { chipProps, FiltersBlock, FiltersResult } from 'src/components/filters-result';

// ----------------------------------------------------------------------

export function ContratoTableFiltersResult({
  filters,
  onResetPage,
  totalResults,
  analiseOptions = [],
  sx,
}) {
  const handleRemoveKeyword = useCallback(() => {
    onResetPage();
    filters.setState({ titulo: '' });
  }, [filters, onResetPage]);

  const handleRemoveStatus = useCallback(() => {
    onResetPage();
    filters.setState({ status: 'all' });
  }, [filters, onResetPage]);

  const handleRemoveAnalise = useCallback(() => {
    onResetPage();
    filters.setState({ analise: 'all' });
  }, [filters, onResetPage]);

  const analiseLabel =
    analiseOptions.find((opt) => opt.value === filters.state.analise)?.label ??
    filters.state.analise;

  const handleReset = useCallback(() => {
    onResetPage();
    filters.onResetState();
  }, [filters, onResetPage]);

  return (
    <FiltersResult totalResults={totalResults} onReset={handleReset} sx={sx}>
      <FiltersBlock label="Status:" isShow={filters.state.status !== 'all'}>
        <Chip
          {...chipProps}
          label={filters.state.status}
          onDelete={handleRemoveStatus}
          sx={{ textTransform: 'capitalize' }}
        />
      </FiltersBlock>

      <FiltersBlock label="Análise:" isShow={filters.state.analise !== 'all'}>
        <Chip {...chipProps} label={analiseLabel} onDelete={handleRemoveAnalise} />
      </FiltersBlock>

      <FiltersBlock label="Busca:" isShow={!!filters.state.titulo}>
        <Chip {...chipProps} label={filters.state.titulo} onDelete={handleRemoveKeyword} />
      </FiltersBlock>
    </FiltersResult>
  );
}
