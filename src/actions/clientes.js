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

export async function deleteCliente(clienteDta) {
  const res = await axios.post(endpoints.clientes.create, invoiceData);
  return res.data;
}

// ----------------------------------------------------------------------

export async function updateCliente(id, clienteDta) {
  const res = await axios.put(`${endpoints.clientes.update}/${id}`, clienteDta);
  return res;
}

// ----------------------------------------------------------------------

export async function criarCliente(clienteDta) {
  const res = await axios.post(`${endpoints.clientes.list}`, clienteDta);
  return res;
}
