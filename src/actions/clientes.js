import useSWR from 'swr';
import { useMemo } from 'react';

import axios, { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export async function getClientes(params) {
  const res = await axios.get(endpoints.clientes.list, { params });
  return res.data;
}

// ----------------------------------------------------------------------

export function useGetAllClientes(params = {}) {
  // Adicionar filtros padrão
  const defaultParams = {
    status: true,
    tipoContato: 'cliente',
    ...params,
  };
  
  const queryString = new URLSearchParams(
    Object.entries(defaultParams).filter(([_, v]) => v !== undefined && v !== null && v !== '')
  ).toString();
  
  const url = queryString ? `${endpoints.clientes.list}?${queryString}` : endpoints.clientes.list;
  
  console.log(url)
  const { data, isLoading, error, mutate } = useSWR(
    url,
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return useMemo(
    () => ({
      data: data || [],
      isLoading,
      error,
      mutate,
    }),
    [data, error, isLoading, mutate]
  );
}

// ----------------------------------------------------------------------

export async function getClientesAndLeads(params) {
  const res = await axios.get(endpoints.clientes.leads, { params });
  
  return res.data;
}

// ----------------------------------------------------------------------

export async function getClienteById(id) {
  const res = await axios.get(`${endpoints.clientes.list}/${id}`);
  return res.data;
}

// ----------------------------------------------------------------------

export async function deleteCliente(id) {
  const res = await axios.post(endpoints.clientes.create, id);
  return res.data;
}

// ----------------------------------------------------------------------

export async function updateCliente(id, clienteDta) {
  const res = await axios.put(`${endpoints.clientes.update}/${id}`, clienteDta);

  const response = res;
  return response;
}

// ----------------------------------------------------------------------

export async function criarCliente(clienteDta) {
  const res = await axios.post(`${endpoints.clientes.list}`, clienteDta);
  const response = res;

  return response;
}

export async function historicoCliente(id) {
  const res = await axios.get(`${endpoints.clientes.historico}/${id}`);
  return res.data;
}
