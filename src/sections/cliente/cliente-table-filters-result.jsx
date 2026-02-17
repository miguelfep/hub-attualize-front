import { useCallback } from 'react';

import Chip from '@mui/material/Chip';

import { chipProps, FiltersBlock, FiltersResult } from 'src/components/filters-result';

// ----------------------------------------------------------------------

export function ClienteTableFiltersResult({ filters, onResetPage, totalResults, sx }) {
  const handleRemoveKeyword = useCallback(() => {
    onResetPage();
    filters.setState({ search: '' });
  }, [filters, onResetPage]);

  const handleRemoveStatus = useCallback(() => {
    onResetPage();
    filters.setState({ status: 'all' });
  }, [filters, onResetPage]);

  const handleRemoveRegimeTributario = useCallback(() => {
    onResetPage();
    filters.setState({ regimeTributario: 'all' });
  }, [filters, onResetPage]);

  const handleRemovePlanoTributacao = useCallback(() => {
    onResetPage();
    filters.setState({ planoTributacao: 'all' });
  }, [filters, onResetPage]);

  const handleReset = useCallback(() => {
    onResetPage();
    filters.onResetState();
  }, [filters, onResetPage]);

  const getStatusLabel = (status) => {
    if (status === true) return 'Ativo';
    if (status === false) return 'Inativo';
    return 'Todos';
  };

  const getRegimeLabel = (regime) => {
    const options = {
      simples: 'Simples Nacional',
      presumido: 'Lucro Presumido',
      real: 'Lucro Real',
      pf: 'Pessoa Física',
    };
    return options[regime] || regime;
  };

  const getPlanoLabel = (plano) => {
    const options = {
      anexo1: 'Anexo I',
      anexo2: 'Anexo II',
      anexo3: 'Anexo III',
      anexo4: 'Anexo IV',
      anexo5: 'Anexo V',
      simei: 'SIMEI',
      autonomo: 'Autônomo',
    };
    return options[plano] || plano;
  };

  return (
    <FiltersResult totalResults={totalResults} onReset={handleReset} sx={sx}>
      <FiltersBlock label="Status:" isShow={filters.state.status !== 'all'}>
        <Chip
          {...chipProps}
          label={getStatusLabel(filters.state.status)}
          onDelete={handleRemoveStatus}
          sx={{ textTransform: 'capitalize' }}
        />
      </FiltersBlock>

      <FiltersBlock label="Busca:" isShow={!!filters.state.search?.trim()}>
        <Chip
          {...chipProps}
          label={filters.state.search}
          onDelete={handleRemoveKeyword}
        />
      </FiltersBlock>

      <FiltersBlock label="Regime Tributário:" isShow={filters.state.regimeTributario !== 'all'}>
        <Chip
          {...chipProps}
          label={getRegimeLabel(filters.state.regimeTributario)}
          onDelete={handleRemoveRegimeTributario}
        />
      </FiltersBlock>

      <FiltersBlock label="Plano Tributação:" isShow={filters.state.planoTributacao !== 'all'}>
        <Chip
          {...chipProps}
          label={getPlanoLabel(filters.state.planoTributacao)}
          onDelete={handleRemovePlanoTributacao}
        />
      </FiltersBlock>
    </FiltersResult>
  );
}
