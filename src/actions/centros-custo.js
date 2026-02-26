import axios, { endpoints } from 'src/utils/axios';

export async function listarCentrosCusto() {
  const res = await axios.get(endpoints.centrosCusto.list);
  return res.data;
}

export async function buscarCentroCustoPorId(id) {
  const res = await axios.get(endpoints.centrosCusto.get(id));
  return res.data;
}

export async function criarCentroCusto(data) {
  const res = await axios.post(endpoints.centrosCusto.create, data);
  return res.data;
}

export async function atualizarCentroCusto(id, data) {
  const res = await axios.put(endpoints.centrosCusto.update(id), data);
  return res.data;
}

export async function deletarCentroCusto(id) {
  await axios.delete(endpoints.centrosCusto.delete(id));
}
