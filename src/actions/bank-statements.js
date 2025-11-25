import axios, { endpoints } from 'src/utils/axios';

export async function getBankStatements() {
  const response = await axios.get(endpoints.conciliacao.bankStatements);
  return response.data;
}

export async function uploadBankStatements(files) {
  const formData = new FormData();
  Array.from(files).forEach((file) => formData.append('files', file));

  const response = await axios.post(endpoints.conciliacao.bankStatements, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
}

export async function updateBankStatement(transactionId, updates) {
  const response = await axios.patch(endpoints.conciliacao.bankStatements, {
    transactionId,
    updates,
  });

  return response.data;
}

export async function uploadClienteExtratos(clienteId, files) {
  const formData = new FormData();
  Array.from(files).forEach((file) => formData.append('files', file));
  formData.append('clienteId', clienteId);

  const response = await axios.post(endpoints.conciliacao.clienteExtratos, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
}

export async function getClienteExtratosStatus(clienteId) {
  const response = await axios.get(endpoints.conciliacao.clienteExtratosStatus(clienteId));
  return response.data;
}

export async function getClientesExtratosStatus() {
  const response = await axios.get(endpoints.conciliacao.clientesExtratosStatus);
  return response.data;
}

export async function getClienteLancamentos(clienteId, mesAno) {
  const response = await axios.get(endpoints.conciliacao.clienteLancamentos(clienteId, mesAno));
  return response.data;
}
