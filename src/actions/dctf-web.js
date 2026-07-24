import axios from 'src/utils/axios';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export async function emitirGuiaDctfWeb(clienteId, { categoria, anoPA, mesPA, idsSistemaOrigem }) {
  return axios.post(`${baseUrl}serpro/${clienteId}/dctf-web/emitir-guia`, {
    categoria,
    anoPA,
    mesPA: mesPA || undefined,
    idsSistemaOrigem: idsSistemaOrigem?.length ? idsSistemaOrigem : undefined,
  });
}

export async function emitirLoteDctfWeb({ clienteIds, categoria, anoPA, mesPA, idsSistemaOrigem }) {
  return axios.post(`${baseUrl}serpro/dctf-web/emitir-lote`, {
    clienteIds,
    categoria,
    anoPA,
    mesPA: mesPA || undefined,
    idsSistemaOrigem: idsSistemaOrigem?.length ? idsSistemaOrigem : undefined,
  });
}

export async function consultarStatusLote({ jobIds }) {
  return axios.post(`${baseUrl}serpro/dctf-web/lote-status`, { jobIds });
}

export async function getRelatorioDctfWeb({ competencia, clienteIds }) {
  const params = { competencia };
  if (clienteIds?.length) {
    params.clienteIds = clienteIds.join(',');
  }
  return axios.get(`${baseUrl}serpro/dctf-web/relatorio`, { params });
}

export async function listarLotesAtivos() {
  return axios.get(`${baseUrl}serpro/dctf-web/lotes-ativos`);
}

export async function listarHistoricoLotes({ page = 1, limit = 20 } = {}) {
  return axios.get(`${baseUrl}serpro/dctf-web/lotes/historico`, { params: { page, limit } });
}

export async function getLoteDetalhe(loteId) {
  return axios.get(`${baseUrl}serpro/dctf-web/lotes/${loteId}`);
}

export async function finalizarLote(loteId) {
  return axios.delete(`${baseUrl}serpro/dctf-web/lote/${loteId}`);
}
