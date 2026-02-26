import Cookies from 'js-cookie';

import axios, { endpoints } from 'src/utils/axios';

import { STORAGE_KEY } from 'src/auth/context/jwt/constant';

function getAuthConfig(extra = {}) {
  const token = Cookies.get(STORAGE_KEY);
  return {
    ...extra,
    headers: {
      ...extra.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };
}

export async function listarCategoriasFinanceiras(tipo) {
  const params = tipo ? { tipo } : {};
  const res = await axios.get(endpoints.categoriasFinanceiras.list, getAuthConfig({ params }));
  return res.data;
}

export async function buscarCategoriaFinanceiraPorId(id) {
  const res = await axios.get(endpoints.categoriasFinanceiras.get(id), getAuthConfig());
  return res.data;
}

export async function criarCategoriaFinanceira(data) {
  const res = await axios.post(endpoints.categoriasFinanceiras.create, data, getAuthConfig());
  return res.data;
}

export async function atualizarCategoriaFinanceira(id, data) {
  const res = await axios.put(endpoints.categoriasFinanceiras.update(id), data, getAuthConfig());
  return res.data;
}

export async function deletarCategoriaFinanceira(id) {
  await axios.delete(endpoints.categoriasFinanceiras.delete(id), getAuthConfig());
}
