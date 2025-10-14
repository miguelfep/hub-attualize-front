import useSWR from 'swr';

import { fetcher, endpoints } from 'src/utils/axios';

const API_URL = endpoints.clientes.historico;

export function useHistoricoCliente(clienteId) {
  const { data, error, isLoading, mutate } = useSWR(
    clienteId ? `${API_URL}/${clienteId}` : null,
    fetcher
  );

  return {
    historico: data || [], 
    historicoIsLoading: isLoading, 
    historicoError: error,
    refetchHistorico: mutate, 
  };
}
