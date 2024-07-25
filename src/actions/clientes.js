import axios, { endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export async function getClientes() {
  const res = await axios.get(endpoints.clientes.list);
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
