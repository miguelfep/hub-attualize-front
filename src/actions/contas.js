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
// centroCustoId (opcional): filtra contas pelo centro de custo
export async function buscarContasPagarPorPeriodo(dataInicio, dataFim, centroCustoId) {
  const params = { dataInicio, dataFim };
  if (centroCustoId) params.centroCustoId = centroCustoId;
  const res = await axios.get(endpoints.contasPagar.mes, { params });
  return res.data;
}

// Função para buscar conta a pagar por ID
export async function buscarContaPagarPorId(id) {
  const res = await axios.get(`${endpoints.contasPagar.get}/${id}`);
  return res.data;
}

// Função para buscar parcelas seguintes (para exibir antes de excluir "esta e as seguintes")
export async function buscarParcelasSeguintes(id) {
  const res = await axios.get(`${endpoints.contasPagar.get}/${id}/parcelas-seguintes`);
  return res.data;
}

// Função para buscar todas as parcelas da série recorrente (anteriores, atual e futuras) com status
export async function buscarTodasParcelasRecorrente(id) {
  const res = await axios.get(`${endpoints.contasPagar.get}/${id}/parcelas-todas`);
  return res.data;
}

// Função para atualizar uma conta a pagar por ID
export async function atualizarContaPagarPorId(id, data) {
  const res = await axios.put(`${endpoints.contasPagar.update}/${id}`, data);
  return res.data;
}

// Função para deletar uma conta a pagar por ID
// options.apenasEsta = true → exclui só esta parcela; omitido → exclui esta + parcelas seguintes (RECORRENTE)
export async function deletarContaPagarPorId(id, options = {}) {
  const params = options.apenasEsta ? { apenasEsta: 'true' } : {};
  return axios.delete(`${endpoints.contasPagar.delete}/${id}`, { params });
}

// Função para registrar uma conta a pagar no Banco Inter
export async function registrarContaNoBancoInter(id) {
  const res = await axios.post(`${endpoints.contasPagar.registrar}/${id}/agendamento/inter`);
  return res.data;
}

export async function listarBancos() {
  const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}financeiro/bancos`);
  return response.data;
}

// Função para agendar pagamento de uma conta a pagar via Banco Inter
export async function agendarPagamento(id, data) {
  const res = await axios.post(`${endpoints.contasPagar.agendamentoInter}/${id}`, data);
  return res.data;
}
