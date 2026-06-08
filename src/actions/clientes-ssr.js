import axiosLib from 'axios';
import { cookies } from 'next/headers';

import axios, { endpoints } from 'src/utils/axios';

import { CONFIG } from 'src/config-global';

import { STORAGE_KEY } from 'src/auth/context/jwt/constant';

// ----------------------------------------------------------------------

/**
 * Lê o JWT do cookie da requisição (server-side). O token só é injetado no
 * axios compartilhado no client; em Server Components precisamos encaminhá-lo
 * manualmente, senão o backend não identifica o usuário (e o escopo de
 * empresas barra o acesso).
 */
async function authHeaders() {
  try {
    const token = (await cookies()).get(STORAGE_KEY)?.value;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

/**
 * Server-side function to get cliente by ID.
 * This file is for Server Components only (no 'use client').
 *
 * Retorna `null` quando o cliente não existe ou o usuário não tem acesso
 * (escopo de empresas — `403`/`404`), para a página tratar com `notFound()`.
 */
export async function getClienteById(id) {
  if (!id) {
    throw new Error('ID do cliente é obrigatório');
  }

  try {
    const res = await axiosLib.get(`${endpoints.clientes.list}/${id}`, {
      baseURL: CONFIG.site.serverUrl || undefined,
      headers: await authHeaders(),
    });
    return res.data;
  } catch (error) {
    const status = error?.response?.status;
    if (status === 403 || status === 404) {
      return null; // sem acesso / inexistente — tratado como notFound na page
    }
    console.error(
      'Erro ao buscar cliente:',
      status ?? '',
      error?.response?.data ?? error?.message ?? error
    );
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
