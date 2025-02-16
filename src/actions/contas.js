import axios, { endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

// Função para criar uma nova conta a pagar
export async function criarContaPagar(data) {
  const res = await axios.post(endpoints.contasPagar.criar, data);
  return res.data;
}

// Função para buscar contas a pagar por mês
export async function buscarContasPagarPorMes(dataInicio, dataFim) {
  const res = await axios.post(endpoints.contasPagar.mes, {
    params: {
      dataInicio,
      dataFim,
    },
  });
  return res.data;
}

// Função para buscar cobranças por um intervalo de datas
export async function buscarContasPagarPorPeriodo(dataInicio, dataFim) {
  const res = await axios.get(endpoints.contasPagar.mes, {
    params: {
      dataInicio,
      dataFim,
    },
  });
  return res.data;
}

// Função para buscar conta a pagar por ID
export async function buscarContaPagarPorId(id) {
  const res = await axios.get(`${endpoints.contasPagar.get}/${id}`);
  return res.data;
}

// Função para atualizar uma conta a pagar por ID
export async function atualizarContaPagarPorId(id, data) {
  const res = await axios.put(`${endpoints.contasPagar.update}/${id}`, data);
  return res.data;
}

// Função para deletar uma conta a pagar por ID
export async function deletarContaPagarPorId(id) {
  return axios.delete(`${endpoints.contasPagar.delete}/${id}`);
}

// Função para registrar uma conta a pagar no Banco Inter
export async function registrarContaNoBancoInter(id) {
  const res = await axios.post(`${endpoints.contasPagar.registrar}/${id}/agendamento/inter`);
  return res.data;
}

export async function listarBancos() {
  const response = await axios.get('http://localhost:9443/api/financeiro/bancos');
  return response.data;
}

// Função para agendar pagamento de uma conta a pagar via Banco Inter
export async function agendarPagamento(id, data) {
  const res = await axios.post(`${endpoints.contasPagar.agendamentoInter}/${id}`, data);
  return res.data;
}
