import useSWR from 'swr';

import axios, { fetcher , endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------
// PAGAMENTO ÚNICO
// ----------------------------------------------------------------------

/**
 * Processa um pagamento único com cartão de crédito
 */
export async function processarPagamentoUnico(dados) {
  try {
    const response = await axios.post(endpoints.mercadoPago.pagamentoUnico, dados);
    return response.data;
  } catch (error) {
    console.error('Erro ao processar pagamento:', error);
    throw error;
  }
}

/**
 * Consulta opções de parcelamento para um valor
 */
export async function consultarParcelamento(valor, paymentMethodId = 'visa') {
  try {
    const response = await axios.get(endpoints.mercadoPago.parcelamento, {
      params: { valor, paymentMethodId },
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao consultar parcelamento:', error);
    throw error;
  }
}

/**
 * Hook para buscar opções de parcelamento
 */
export function useParcelamento(valor, paymentMethodId = 'visa') {
  const shouldFetch = valor && valor > 0;
  
  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? `${endpoints.mercadoPago.parcelamento}?valor=${valor}&paymentMethodId=${paymentMethodId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    opcoes: data?.opcoes || [],
    valorBase: data?.valorBase || 0,
    isLoading,
    error,
    mutate,
  };
}

// ----------------------------------------------------------------------
// ASSINATURAS RECORRENTES
// ----------------------------------------------------------------------

/**
 * Cria uma assinatura recorrente
 */
export async function criarAssinatura(contratoId, cardToken) {
  try {
    const response = await axios.post(endpoints.mercadoPago.assinatura, {
      contratoId,
      cardToken,
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao criar assinatura:', error);
    throw error;
  }
}

/**
 * Consulta detalhes de uma assinatura
 */
export async function consultarAssinatura(contratoId) {
  try {
    const response = await axios.get(endpoints.mercadoPago.assinaturaDetalhes(contratoId));
    return response.data;
  } catch (error) {
    console.error('Erro ao consultar assinatura:', error);
    throw error;
  }
}

/**
 * Pausa uma assinatura
 */
export async function pausarAssinatura(contratoId) {
  try {
    const response = await axios.post(endpoints.mercadoPago.assinaturaPausar(contratoId));
    return response.data;
  } catch (error) {
    console.error('Erro ao pausar assinatura:', error);
    throw error;
  }
}

/**
 * Reativa uma assinatura pausada
 */
export async function reativarAssinatura(contratoId) {
  try {
    const response = await axios.post(endpoints.mercadoPago.assinaturaReativar(contratoId));
    return response.data;
  } catch (error) {
    console.error('Erro ao reativar assinatura:', error);
    throw error;
  }
}

/**
 * Cancela uma assinatura (irreversível)
 */
export async function cancelarAssinatura(contratoId) {
  try {
    const response = await axios.post(endpoints.mercadoPago.assinaturaCancelar(contratoId));
    return response.data;
  } catch (error) {
    console.error('Erro ao cancelar assinatura:', error);
    throw error;
  }
}

// ----------------------------------------------------------------------
// CONSULTAS
// ----------------------------------------------------------------------

/**
 * Consulta um pagamento específico
 */
export async function consultarPagamento(pagamentoId) {
  try {
    const response = await axios.get(endpoints.mercadoPago.pagamento(pagamentoId));
    return response.data;
  } catch (error) {
    console.error('Erro ao consultar pagamento:', error);
    throw error;
  }
}

/**
 * Lista pagamentos de um cliente
 */
export async function listarPagamentosCliente(clienteId, filtros = {}) {
  try {
    const response = await axios.get(endpoints.mercadoPago.pagamentosCliente(clienteId), {
      params: filtros,
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao listar pagamentos:', error);
    throw error;
  }
}

/**
 * Hook para buscar pagamentos de um cliente
 */
export function usePagamentosCliente(clienteId, filtros = {}) {
  const shouldFetch = !!clienteId;
  
  const queryParams = new URLSearchParams(filtros).toString();
  const url = shouldFetch 
    ? `${endpoints.mercadoPago.pagamentosCliente(clienteId)}${queryParams ? `?${queryParams}` : ''}` 
    : null;

  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    pagamentos: data?.data || [],
    total: data?.total || 0,
    isLoading,
    error,
    mutate,
  };
}

