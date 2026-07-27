import axios, { endpoints } from 'src/utils/axios';

export async function consultarPagamentoWeb({ clienteId, cnpj, ano, mes }) {
  const res = await axios.post(endpoints.pagamentoWeb.consultar, {
    clienteId,
    cnpj,
    ano,
    ...(mes ? { mes } : {}),
  });
  return res.data;
}

export async function consultarPagamentoWebFromLog(clienteId, { ano, mes }) {
  const res = await axios.get(endpoints.pagamentoWeb.ultimoLog(clienteId), {
    params: { ano, ...(mes ? { mes } : {}) },
  });
  return res.data;
}

export async function getPagtoWebDetalhe(id) {
  const res = await axios.get(endpoints.pagamentoWeb.pagtoWebDetalhe(id));
  return res.data;
}

/**
 * Preview da conciliação: devolve os casamentos entre os pagamentos do PagtoWeb e as
 * guias em aberto do cliente. Nada é gravado — a baixa depende de confirmação.
 */
export async function conciliarPagamentos({ clienteId, ano, mes }) {
  const res = await axios.post(endpoints.pagamentoWeb.conciliar, {
    clienteId,
    ano,
    ...(mes ? { mes } : {}),
  });
  return res.data;
}

/** Aplica a baixa nas guias confirmadas pelo usuário no modal de preview. */
export async function aplicarConciliacao({ clienteId, ano, mes, guiaIds }) {
  const res = await axios.post(endpoints.pagamentoWeb.aplicarConciliacao, {
    clienteId,
    ano,
    ...(mes ? { mes } : {}),
    guiaIds,
  });
  return res.data;
}
