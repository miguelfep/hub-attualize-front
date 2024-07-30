import axios, { endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export async function getServiceItens() {
  const res = await axios.get('https://api.attualizecontabil.com.br/api/financeiro/services/itens');
  return res.data;
}

// ----------------------------------------------------------------------

export async function getServiceItemById(id) {
  const res = await axios.get(`${endpoints.invoices.list}/${id}`);
  return res.data;
}

// ----------------------------------------------------------------------

export async function createServiceItem(itemData) {
  const res = await axios.post(endpoints.invoices.create, itemData);
  return res.data;
}

// ----------------------------------------------------------------------

export async function updateServiceItem(id, itemData) {
  const res = await axios.put(`${endpoints.invoices.update}/${id}`, itemData);
  return res.data;
}
