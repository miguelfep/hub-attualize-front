import axios, { endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export async function getServiceItens() {
  const res = await axios.get(endpoints.serviceItens.list);
  const { data } = res;
  return Array.isArray(data?.servicesItem) ? data.servicesItem : [];
}

// ----------------------------------------------------------------------

export async function getServiceItemById(id) {
  const res = await axios.get(endpoints.serviceItens.list);
  const { data } = res;
  const list = Array.isArray(data?.servicesItem) ? data.servicesItem : [];
  return list.find((item) => item._id === id) ?? null;
}

// ----------------------------------------------------------------------

export async function createServiceItem(itemData) {
  const res = await axios.post(endpoints.serviceItens.create, itemData);
  return res.data;
}

// ----------------------------------------------------------------------

export async function updateServiceItem(id, itemData) {
  const res = await axios.put(endpoints.serviceItens.update(id), itemData);
  return res.data;
}

// ----------------------------------------------------------------------

export async function deleteServiceItem(id) {
  await axios.delete(endpoints.serviceItens.delete(id));
}
