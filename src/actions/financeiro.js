import axios, { endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

// Função para obter todos os contratos
export async function getContratos() {
  const res = await axios.get(endpoints.contratos.list);
  return res.data;
}

// Função para obter contrato por ID
export async function getContratoPorId(id) {
  try {
    const res = await axios.get(`${endpoints.contratos.get}/${id}`);
    return res.data;
  } catch (error) {
    console.error('Erro ao buscar contrato por ID:', error);
    throw error;
  }
}

// Função para criar um novo contrato
export async function postContrato(data) {
  return axios.post(endpoints.contratos.new, data);
}

// Função para atualizar um contrato
export async function updateContrato(id, invoiceData) {
  return axios.put(`${endpoints.contratos.update}/${id}`, invoiceData);
}

// Função para buscar cobranças de um contrato por ID
export async function buscarCobrancasContratoId(id) {
  return axios.get(`${endpoints.contratos.update}/cobrancas/${id}`);
}

// Função para atualizar uma cobrança por ID
export async function atualizarCobrancaPorId(id, data) {
  return axios.put(`${endpoints.contratos.update}/cobrancas/atualizar/${id}`, data);
}

// Função para buscar contratos por mês
export async function getContratosPorMes(month) {
  const res = await axios.get(`${endpoints.contratos.faturasMesAno}/${month}`);
  return res.data;
}

// Função para cancelar um boleto por ID
export async function cancelarBoleto(id) {
  const res = await axios.post(`${endpoints.contratos.update}/cobrancas/cancelar/${id}`);
  
  return res.data;
}

// Função para buscar cobranças por um intervalo de datas
export async function getCobrancasPorData(dataInicio, dataFim) {
  const res = await axios.get(`${endpoints.contratos.faturasDatas}`, {
    params: {
      dataInicio,
      dataFim,
    },
  });
  return res.data;
}

// Função para buscar contratos por cliente ID
export async function getContratosPorClienteID(id) {
  const res = await axios.get(`${endpoints.contratos.cliente}/${id}`);
  return res.data;
}

// Função para deletar um contrato por ID
export async function deletarContrato(id) {
  const res = await axios.delete(`${endpoints.contratos.delete}/${id}`);
  return res.data;
}

// Função para criar uma cobrança por contrato
export async function criarCobrancasPorContrato(data) {
  const res = await axios.post(`${endpoints.contratos.criarCobranca}`, data);
  return res.data;
}

// Função para deletar uma cobrança por ID
export async function deletarCobrancaPorId(id) {
  const res = await axios.delete(`${endpoints.contratos.deleteCobranca}/${id}`);
  return res.data;
}

// Função para obter uma cobrança por ID
export async function getCobrancaPorId(id) {
  try {
    const res = await axios.get(`${endpoints.contratos.update}/cobrancas/${id}`);
    return res.data;
  } catch (error) {
    console.error('Erro ao buscar cobrança por ID:', error);
    throw error;
  }
}

// Função para gerar um boleto por ID de cobrança
export async function gerarBoletoPorId(id) {
  return axios.post(`${endpoints.contratos.gerarBoleto}/${id}`);
}

// Função para buscar fatura por ID
export async function getFaturaPorId(id) {
  try {
    const res = await axios.get(`${endpoints.contratos.fatura}/${id}`);
    return res.data;
  } catch (error) {
    console.error('Erro ao buscar fatura por ID:', error);
    throw error;
  }
}

// Função para enviar boleto por mensagem (ex. WhatsApp)
export async function enviarBoletoDigisac(data) {
  const res = await axios.post(`${endpoints.contratos.enviarMensagem}`, data);
  return res.data;
}

// Função para criar uma assinatura no Mercado Pago
export async function criarAssinaturaMercadoPago(data) {
  const res = await axios.post(endpoints.contratos.subscription, data);
  return res.data;
}

// Função para calcular totais de faturas
export function calcularTotais(invoices) {
  let pago = 0;
  let pendente = 0;
  let vencido = 0;
  invoices.forEach((invoice) => {
    if (invoice.status === 'PAGO' || invoice.status === 'RECEBIDO') {
      pago += invoice.valor;
    } else if (invoice.status === 'EMABERTO') {
      pendente += invoice.valor;
    } else if (invoice.status === 'VENCIDO') {
      vencido += invoice.valor;
    }
  });
  return { pago, pendente, vencido };
}
