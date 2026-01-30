import axios, { endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

/**
 * Server-side function to get cliente by ID
 * This file is for Server Components only (no 'use client')
 */
export async function getClienteById(id) {
  if (!id) {
    throw new Error('ID do cliente é obrigatório');
  }

  try {
    const res = await axios.get(`${endpoints.clientes.list}/${id}`);
    return res.data;
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    throw error;
  }
}

// ----------------------------------------------------------------------

/**
 * Server-side function to get all clientes
 */
export async function getClientes(params) {
  try {
    const res = await axios.get(endpoints.clientes.list, { params });
    return res.data;
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    throw error;
  }
}
