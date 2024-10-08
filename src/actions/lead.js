import axios, { endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export async function criarLead(leadData) {
  const res = await axios.post(endpoints.marketing.create, leadData);
  return res.data;
}

// ----------------------------------------------------------------------

export async function atualizarLead(id, leadData) {
  const res = await axios.put(`${endpoints.marketing.update}/${id}`, leadData);
  return res.data;
}

export async function buscarDadosDashboard() {
  const res = await axios.get(`${endpoints.marketing.dashboard}`);
  return res.data;
}
