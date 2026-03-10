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

// ----------------------------------------------------------------------
// Nova API ms-me — financeiro (boleto, cobranças, assinatura)
// ----------------------------------------------------------------------

/** Gera boleto para uma cobrança (POST /api/contratos/financeiro/boleto/:cobrancaId) */
export async function gerarBoletoFinanceiro(cobrancaId) {
  const res = await axios.post(endpoints.contratos.financeiro.boleto(cobrancaId));
  return res.data;
}

/** Lista cobranças do contrato (GET /api/contratos/financeiro/cobrancas?contratoId=) — campo boleto é JSON com linhaDigitavel, pixCopiaECola */
export async function listarCobrancasFinanceiro(contratoId) {
  const res = await axios.get(endpoints.contratos.financeiro.cobrancas(contratoId));
  return res.data;
}

/** Cancela boleto (POST /api/contratos/financeiro/cancelar-boleto/:cobrancaId) */
export async function cancelarBoletoFinanceiro(cobrancaId) {
  const res = await axios.post(endpoints.contratos.financeiro.cancelarBoleto(cobrancaId));
  return res.data;
}

/** Atualiza boleto expirado (POST /api/contratos/financeiro/atualizar-boleto/:cobrancaId), body opcional: { novaDataVencimento, novoValor } */
export async function atualizarBoletoFinanceiro(cobrancaId, body = {}) {
  const res = await axios.post(endpoints.contratos.financeiro.atualizarBoleto(cobrancaId), body);
  return res.data;
}

/** Assinatura recorrente Mercado Pago (POST /api/contratos/:contratoId/assinar-mercadopago), body: { provider, method: 'subscription', email, cpfCnpj } */
export async function assinarContratoMercadoPago(contratoId, body) {
  const res = await axios.post(endpoints.contratos.financeiro.assinarMercadoPago(contratoId), body);
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
